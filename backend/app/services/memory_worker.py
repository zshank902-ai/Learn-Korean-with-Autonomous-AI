import asyncio
import os
import json
import httpx
from app.db.session import SessionLocal
from app.models.user import UserProgress

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

MEMORY_SYSTEM_PROMPT = """You are an advanced AI Memory Summarizer for a Korean language tutor app.
Analyze the user's recent chat history. Extract two things:
1. User's personal interests (e.g. likes K-pop, studying for travel, etc.)
2. User's grammatical weaknesses (e.g. struggles with past tense, politeness levels)

Write a short, concise paragraph summarizing these insights. This will be fed directly to the Tutor LLM as context for future sessions.
Keep it strictly under 50 words. Do not include greetings.
"""

class MemoryWorker:
    async def summarize_and_save(self, history: list, user_id: int = 1):
        """
        Background task to update long-term memory based on chat history.
        """
        if not GROQ_API_KEY:
            print("MemoryWorker: No Groq API Key. Skipping memory update.")
            return

        try:
            # Flatten history into a readable script
            chat_script = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
            
            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": MEMORY_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Chat History:\n{chat_script}"}
                ],
                "temperature": 0.3,
                "max_tokens": 100
            }
            
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(GROQ_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                summary = data["choices"][0]["message"]["content"].strip()
                
            print(f"MemoryWorker: Generated summary: {summary}")
            
            # Save to DB
            db = SessionLocal()
            try:
                progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
                if not progress:
                    progress = db.query(UserProgress).first()
                    
                if progress:
                    # Append or overwrite? For MVP, overwrite is fine.
                    progress.long_term_memory = summary
                    db.commit()
                    print("MemoryWorker: Successfully saved to database.")
            except Exception as db_err:
                db.rollback()
                print(f"MemoryWorker DB Error: {db_err}")
            finally:
                db.close()
                
        except Exception as e:
            print(f"MemoryWorker Error: {e}")

memory_worker = MemoryWorker()
