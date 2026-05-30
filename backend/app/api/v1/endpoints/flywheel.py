from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import uuid
import base64

router = APIRouter()

# MongoDB Configuration — lazy initialization to avoid crash if MongoDB is not running
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_mongo_client = None
_mongo_collection = None


def _get_mongo_collection():
    """Lazily initialize MongoDB connection. Returns None if MongoDB is unavailable."""
    global _mongo_client, _mongo_collection
    if _mongo_collection is not None:
        return _mongo_collection
    try:
        _mongo_client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = _mongo_client["k_mastery_ml"]
        _mongo_collection = db["ml_training_backlog"]
        return _mongo_collection
    except Exception as e:
        print(f"Data Flywheel: MongoDB unavailable ({e}). Ingestion disabled.")
        return None


async def save_to_mongo(payload: dict):
    """Background task to ensure non-blocking ingestion."""
    collection = _get_mongo_collection()
    if collection is None:
        print(f"Data Flywheel: Skipping MongoDB save — no connection available.")
        return
    try:
        await collection.insert_one(payload)
        print(f"Architect_Log: Anomaly sample {payload['sample_id']} stored in MongoDB.")
    except Exception as e:
        print(f"Critical: MongoDB Ingestion Failed - {e}")

@router.post("/ingest")
async def ingest_anomaly(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    confidence_score: float = Form(...),
    predicted_label: str = Form(...),
    actual_context: str = Form("N/A")
):
    """
    Principal MLOps Lead: MongoDB Active Learning Pipeline.
    Accepts low-confidence edge samples for RLHF (Reinforcement Learning from Human Feedback).
    """
    # 1. Read binary content and convert to Base64 for MongoDB storage 
    # (Note: GridFS is preferred for >16MB, but for OCR snippets, B64/Binary is fine)
    content = await file.read()
    content_b64 = base64.b64encode(content).decode('utf-8')
    
    sample_id = str(uuid.uuid4())
    
    payload = {
        "sample_id": sample_id,
        "timestamp": datetime.now(timezone.utc),
        "confidence_score": confidence_score,
        "predicted_label": predicted_label,
        "actual_context": actual_context,
        "data_type": file.content_type,
        "binary_payload": content_b64,
        "status": "pending_review"
    }

    # 2. Dispatch to background for persistence
    background_tasks.add_task(save_to_mongo, payload)

    return {
        "status": "queued",
        "sample_id": sample_id,
        "message": "Low-confidence sample ingested for retraining."
    }
