import asyncio
import os
from app.core.ai_config import get_groq_api_key
import tempfile

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()

GROQ_API_KEY = get_groq_api_key()
GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Receives an audio file (e.g. webm, mp3, wav) from the client and transcribes it
    using Groq's ultra-low latency Whisper API.
    """
    if not GROQ_API_KEY:
        # Offline mock response
        await asyncio.sleep(0.5)
        return {
            "text": "이것은 오프라인 모드의 가짜 음성 인식입니다. (This is mock offline transcription)"
        }

    # Save uploaded file to a temporary location
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_path = temp_audio.name
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process uploaded file: {e}"
        )

    try:
        # Call Groq Whisper API
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

        with open(temp_path, "rb") as f:
            files = {"file": ("audio.webm", f, "audio/webm")}
            data = {
                "model": "whisper-large-v3",
                "temperature": "0.0",
                "language": "ko",  # Hint to the model that it's Korean
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GROQ_WHISPER_URL, headers=headers, files=files, data=data
                )

                if response.status_code != 200:
                    print(f"Groq Whisper Error: {response.text}")
                    raise HTTPException(
                        status_code=500, detail=f"Transcription failed: {response.text}"
                    )

                result = response.json()
                transcription = result.get("text", "").strip()
                return {"text": transcription}
    except Exception as e:
        print(f"Speech to text failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"500: Transcription failed: {e}")
    finally:
        # Cleanup temp file safely
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
