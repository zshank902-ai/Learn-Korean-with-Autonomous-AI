from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.production_model import model_server
from app.services.corrector import corrector_service
from app.services.tutor import tutor_service
from app.db.session import SessionLocal
from app.models.user import UserProgress
import json
import asyncio

router = APIRouter()

@router.websocket("/ws/ai-stream")
async def websocket_realtime_correction(websocket: WebSocket):
    """
    Production WebSocket Handler: Processes real-time text streams 
    using the non-blocking ProductionModelServer.
    """
    await websocket.accept()
    print("WebSocket: Connection established for real-time AI feedback.")

    try:
        while True:
            # 1. Receive JSON payload from client
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            
            user_text = payload.get("text", "")
            
            # 2. Tokenization Scaffolding (Simplified for demo)
            # In production, replace with Keras Tokenizer or SentencePiece
            tokens = [ord(c) % 10000 for c in user_text[:50]]
            tokens = tokens + [0] * (50 - len(tokens)) # Padding

            # 3. Non-blocking AI Inference (Sequence Model)
            if model_server.is_ready:
                prediction = await model_server.predict_async(tokens)
                
                # 4. Use corrector service for structured text feedback
                correction_data = await corrector_service.async_get_correction(user_text)
                
                # 5. Stream structured response back to user
                await websocket.send_json({
                    "status": "success",
                    "data": {
                        "original": user_text,
                        "corrected": correction_data.get("corrected"),
                        "explanation": correction_data.get("explanation"),
                        "raw_prediction": prediction
                    },
                    "message": "Real-time analysis complete."
                })
            else:
                await websocket.send_json({
                    "status": "pending",
                    "message": "AI Engine is warming up..."
                })

    except WebSocketDisconnect:
        print("WebSocket: Client disconnected safely.")
    
    except json.JSONDecodeError:
        await websocket.send_json({"status": "error", "message": "Invalid JSON payload."})
    
    except Exception as e:
        print(f"WebSocket Error: {str(e)}")
        # Attempt to inform the client before closing if possible
        try:
            await websocket.send_json({"status": "error", "message": "Internal server error."})
        except:
            pass

@router.websocket("/ws/tutor-chat")
async def websocket_tutor_chat(websocket: WebSocket):
    """
    WebSocket Handler: Processes interactive chat with the AI Korean Tutor.
    Streams back tokens in real-time.
    """
    await websocket.accept()
    print("WebSocket: Connection established for AI Tutor Chat.")

    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            
            # Extract history (array of {role, content})
            history = payload.get("history", [])
            level = payload.get("level", 1)
            is_exam = payload.get("is_exam", False)
            
            if not history:
                continue
                
            # Fetch long term memory from DB
            db = SessionLocal()
            try:
                progress = db.query(UserProgress).first()
                long_term_memory = progress.long_term_memory if progress else None
            finally:
                db.close()
                
            # Stream response back with dynamic level guardrails and memory context
            async for event in tutor_service.async_stream_chat(history, topik_level=level, long_term_memory=long_term_memory, is_exam=is_exam):
                await websocket.send_json(event)
            
            # Send completion signal
            await websocket.send_json({
                "type": "done"
            })
            
            # Fire and forget the background memory summarizer
            from app.services.memory_worker import memory_worker
            asyncio.create_task(memory_worker.summarize_and_save(history))

    except WebSocketDisconnect:
        print("WebSocket: Tutor client disconnected safely.")
    
    except json.JSONDecodeError:
        await websocket.send_json({"type": "error", "message": "Invalid JSON payload."})
    
    except Exception as e:
        print(f"WebSocket Tutor Error: {str(e)}")
        try:
            await websocket.send_json({"type": "error", "message": "Internal server error."})
        except:
            pass

