from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.tutor import ChatSession
import json

router = APIRouter()

@router.get("/session")
def get_tutor_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches the active chat session for the current user. Creates one if none exists."""
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).first()
    
    if not session:
        session = ChatSession(user_id=current_user.id, history_json="[]")
        db.add(session)
        db.commit()
        db.refresh(session)
        
    history = []
    if session.history_json:
        try:
            history = json.loads(session.history_json)
        except json.JSONDecodeError:
            history = []
            
    return {
        "session_id": session.id,
        "history": history
    }

@router.delete("/session")
def clear_tutor_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clears the chat history for the current user."""
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).first()
    
    if session:
        session.history_json = "[]"
        db.commit()
        
    return {"status": "success", "message": "Chat history cleared"}
