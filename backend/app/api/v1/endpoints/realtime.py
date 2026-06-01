import asyncio
import json
import random

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import SessionLocal
from app.models.srs import VocabItem
from app.models.user import UserProgress
from app.services.corrector import corrector_service
from app.services.production_model import model_server
from app.services.tutor import tutor_service

router = APIRouter()


@router.websocket("/ws/ai-stream")
async def websocket_realtime_correction(websocket: WebSocket, token: str = Query(None)):
    """
    Production WebSocket Handler: Processes real-time text streams
    using the non-blocking ProductionModelServer.
    """
    await websocket.accept()
    print("WebSocket: Connection established for real-time AI feedback.")

    db = SessionLocal()
    try:
        if token:
            get_current_user(token, db)
    except Exception:
        # We can either close or allow anonymous depending on strictness. Allowing for now.
        pass
    finally:
        db.close()

    try:
        while True:
            # 1. Receive JSON payload from client
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)

            user_text = payload.get("text", "")

            # 2. Tokenization Scaffolding (Simplified for demo)
            # In production, replace with Keras Tokenizer or SentencePiece
            tokens = [ord(c) % 10000 for c in user_text[:50]]
            tokens = tokens + [0] * (50 - len(tokens))  # Padding

            # 3. Non-blocking AI Inference (Sequence Model)
            if model_server.is_ready:
                prediction = await model_server.predict_async(tokens)

                # 4. Use corrector service for structured text feedback
                correction_data = await corrector_service.async_get_correction(
                    user_text
                )

                # 5. Stream structured response back to user
                await websocket.send_json(
                    {
                        "status": "success",
                        "data": {
                            "original": user_text,
                            "corrected": correction_data.get("corrected"),
                            "explanation": correction_data.get("explanation"),
                            "raw_prediction": prediction,
                        },
                        "message": "Real-time analysis complete.",
                    }
                )
            else:
                await websocket.send_json(
                    {"status": "pending", "message": "AI Engine is warming up..."}
                )

    except WebSocketDisconnect:
        print("WebSocket: Client disconnected safely.")

    except json.JSONDecodeError:
        await websocket.send_json(
            {"status": "error", "message": "Invalid JSON payload."}
        )

    except Exception as e:
        print(f"WebSocket Error: {str(e)}")
        # Attempt to inform the client before closing if possible
        try:
            await websocket.send_json(
                {"status": "error", "message": "Internal server error."}
            )
        except Exception:
            pass


@router.websocket("/ws/tutor-chat")
async def websocket_tutor_chat(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket Handler: Processes interactive chat with the AI Korean Tutor.
    Streams back tokens in real-time.
    """
    await websocket.accept()

    db = SessionLocal()
    try:
        user = get_current_user(token, db)
    except Exception:
        await websocket.close(code=1008, reason="Unauthorized")
        db.close()
        return

    print(
        f"WebSocket: Connection established for AI Tutor Chat (User: {user.nickname})."
    )

    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)

            # Extract history (array of {role, content})
            history = payload.get("history", [])
            level = payload.get("level", 1)
            is_exam = payload.get("is_exam", False)
            session_id = payload.get("session_id")

            if not history:
                continue

            # Fetch long term memory from DB
            db = SessionLocal()
            tsv_words = []
            try:
                progress = (
                    db.query(UserProgress)
                    .filter(UserProgress.user_id == user.id)
                    .first()
                )
                long_term_memory = progress.long_term_memory if progress else None

                if not is_exam:
                    vocab_items = (
                        db.query(VocabItem)
                        .filter(VocabItem.level_id == int(level))
                        .all()
                    )
                    if vocab_items:
                        sampled = random.sample(
                            vocab_items, min(5, len(vocab_items)))
                        tsv_words = [
                            f"{item.word} ({item.meaning})" for item in sampled
                        ]
            finally:
                db.close()

            # Stream response back with dynamic level guardrails and memory context
            ai_full_text = ""
            ai_corrections = []
            async for event in tutor_service.async_stream_chat(
                history,
                topik_level=level,
                long_term_memory=long_term_memory,
                is_exam=is_exam,
                tsv_words=tsv_words,
            ):
                if event.get("type") == "stream":
                    ai_full_text += event.get("chunk", "")
                elif event.get("type") == "corrections":
                    ai_corrections = event.get("data", [])
                await websocket.send_json(event)

            # Send completion signal
            await websocket.send_json({"type": "done"})

            # Construct final history and save to session
            final_history = list(history)
            from typing import Any
            ai_msg: dict[str, Any] = {"role": "ai", "content": ai_full_text}
            if ai_corrections:
                ai_msg["corrections"] = ai_corrections
            final_history.append(ai_msg)

            if session_id:
                try:
                    db = SessionLocal()
                    from app.models.tutor import ChatSession

                    session = (
                        db.query(ChatSession)
                        .filter(ChatSession.id == session_id)
                        .first()
                    )
                    if session:
                        session.history_json = json.dumps(final_history)
                        db.commit()
                except Exception as db_err:
                    print(f"Failed to save session {session_id}: {db_err}")
                finally:
                    db.close()

            # Fire and forget the background memory summarizer
            from app.services.memory_worker import memory_worker

            asyncio.create_task(
                memory_worker.summarize_and_save(final_history))

    except WebSocketDisconnect:
        print("WebSocket: Tutor client disconnected safely.")

    except json.JSONDecodeError:
        await websocket.send_json({"type": "error", "message": "Invalid JSON payload."})

    except Exception as e:
        print(f"WebSocket Tutor Error: {str(e)}")
        try:
            await websocket.send_json(
                {"type": "error", "message": "Internal server error."}
            )
        except Exception:
            pass
