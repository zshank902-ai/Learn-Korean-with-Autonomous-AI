from app.api.v1.endpoints import vocab
import asyncio
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import email as email_router
from app.api.v1.endpoints import exam as exam_router
from app.api.v1.endpoints import flywheel, gamification
from app.api.v1.endpoints import hangul as hangul_router
from app.api.v1.endpoints import onboarding as onboarding_router
from app.api.v1.endpoints import profile as profile_router
from app.api.v1.endpoints import progress as progress_router
from app.api.v1.endpoints import realtime, speech, tutor
from app.api.v1.endpoints import roadmap as roadmap_router
from app.db.session import Base, check_and_upgrade_db, engine, get_db
from app.models.user import UserProgress
from app.services.corrector import corrector_service
from app.services.production_model import model_server
from app.services.sync_worker import sync_worker

# Create tables
Base.metadata.create_all(bind=engine)
check_and_upgrade_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Model Warm-up: Initializing Keras models on startup to ensure zero latency for the first user.
    Uses the modern lifespan context manager (replaces deprecated @app.on_event("startup")).
    """
    print("Principal Architect: Warming up TensorFlow/Keras models...")
    try:
        import os

        if os.getenv("RENDER"):
            print(
                "MLOps: Running on Render Free Tier. Bypassing TensorFlow init to prevent crash."
            )
            model_server.is_mock = True
            model_server.is_ready = True
            model_server.model = "mock"
        else:
            model_server.initialize()

        # Corrector now uses Groq/Ollama — no warm-up needed
        print("Corrector: Groq/Phi-3 via Ollama (on-demand, no warm-up required)")

        print("Primary AI Models (Production LLMs) warmed up and ready.")
    except Exception as e:
        print(f"Warm-up failed: {e}")

    # Auto-seed database if empty
    try:
        from app.db.session import SessionLocal
        from app.models.srs import VocabItem
        from app.scripts.seed_vocab import generate_vocab

        db = SessionLocal()
        try:
            if db.query(VocabItem).count() == 0:
                print("Vocabulary database is empty. Auto-seeding now...")
                generate_vocab(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Auto-seed failed: {e}")

    # Start the periodic DB sync background task (Optimized Worker)
    task = asyncio.create_task(sync_worker.start_perpetual_sync())

    yield  # Application runs here

    # Graceful shutdown: cancel background task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="K-Mastery API", version="1.0.0", lifespan=lifespan)

# Enable CORS for Next.js frontend — MUST be registered before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.2:3000",
        "https://k-mastery.vercel.app",
        "https://learn-korean-with-autonomous-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(profile_router.router,
                   prefix="/api/profile", tags=["Profile"])
app.include_router(email_router.router, prefix="/api/email", tags=["Email"])
app.include_router(
    onboarding_router.router, prefix="/api/onboarding", tags=["Onboarding"]
)
app.include_router(progress_router.router,
                   prefix="/api/progress", tags=["Progress"])
app.include_router(gamification.router,
                   prefix="/api/v1/user", tags=["Gamification"])
app.include_router(vocab.router, prefix="/api/v1", tags=["Vocabulary"])
app.include_router(realtime.router, prefix="/api/v1/ai", tags=["Real-time AI"])
app.include_router(speech.router, prefix="/api/v1/ai", tags=["Speech AI"])
app.include_router(
    flywheel.router, prefix="/api/v1/ai/data-flywheel", tags=["Data Flywheel"]
)
app.include_router(roadmap_router.router,
                   prefix="/api/roadmap", tags=["TOPIK Roadmap"])
app.include_router(exam_router.router, prefix="/api/exam", tags=["TOPIK Exam"])
app.include_router(hangul_router.router,
                   prefix="/api/hangul", tags=["Hangul Mastery"])
app.include_router(tutor.router, prefix="/api/v1/tutor",
                   tags=["Tutor Session"])


@app.get("/")
async def root():
    return {"message": "Welcome to K-Mastery Backend", "status": "active"}


@app.get("/api/v1/topik/roadmap")
def get_roadmap(db: Session = Depends(get_db)):
    """
    Dynamically builds the TOPIK roadmap based on the user's
    current_topik_level stored in the database.
    """
    all_levels = [
        {
            "id": 1,
            "title": "TOPIK I - Level 1",
            "focus": "Survival Korean",
            "modules": [
                "Hangul Alphabet",
                "Greetings & Numbers",
                "Basic Particles (은/는, 이/가)",
                "Present Tense",
            ],
        },
        {
            "id": 2,
            "title": "TOPIK I - Level 2",
            "focus": "Daily Life",
            "modules": [
                "Daily Routines",
                "Honorifics (시/으시)",
                "Past & Future Tense",
                "Conjunctions",
            ],
        },
        {
            "id": 3,
            "title": "TOPIK II - Level 3",
            "focus": "Social Integration",
            "modules": [
                "Expressing Opinions",
                "Indirect Quotations",
                "Complex Particles",
                "Emotional Nuance",
            ],
        },
        {
            "id": 4,
            "title": "TOPIK II - Level 4",
            "focus": "Professional Skills",
            "modules": [
                "Email Etiquette",
                "News Comprehension",
                "Debate Fundamentals",
                "Formal Expressions",
            ],
        },
        {
            "id": 5,
            "title": "TOPIK II - Level 5",
            "focus": "Academic Fluency",
            "modules": [
                "Abstract Reasoning",
                "Hanja Vocabulary",
                "Formal Presentations",
                "Cultural Nuance",
            ],
        },
        {
            "id": 6,
            "title": "TOPIK II - Level 6",
            "focus": "Native-Like Mastery",
            "modules": [
                "Thesis Defense",
                "Specialized Literature",
                "Native Idioms & Slang",
                "Nuanced Debates",
            ],
        },
    ]

    # Query the DB for the user's current level; default to 1 if not found
    progress = db.query(UserProgress).first()
    current_level = progress.current_topik_level if progress else 1

    # Dynamically assign status based on the user's level
    levels_with_status = []
    for lvl in all_levels:
        if int(str(lvl["id"])) < int(str(current_level)):
            status = "completed"
        elif int(str(lvl["id"])) == int(str(current_level)):
            status = "active"
        else:
            status = "locked"
        levels_with_status.append({**lvl, "status": status})

    return {"levels": levels_with_status}


@app.post("/api/v1/analyze/correct")
async def correct_sentence(sentence: str):
    # Calls Groq Cloud (Llama-3) or local Ollama (Phi-3) as fallback
    feedback = await corrector_service.async_get_correction(sentence)
    return feedback
