from app.db.session import SessionLocal
from app.models.user import User, UserProgress
from app.core.security import get_password_hash
import uuid


def test_register():
    db = SessionLocal()
    try:
        # Create user
        nickname = f"test_{uuid.uuid4().hex[:8]}"
        hashed_password = get_password_hash("password")

        db_user = User(
            nickname=nickname,
            email=f"{nickname}@example.com",
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Initialize UserProgress
        progress = UserProgress(
            user_id=db_user.id,
            current_topik_level=1,
            total_xp=0,
            streak_count=0
        )
        db.add(progress)
        db.commit()
        print("Success!")
    except Exception:
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_register()
