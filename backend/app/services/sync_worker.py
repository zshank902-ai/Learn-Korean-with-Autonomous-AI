from sqlalchemy.orm import Session
from app.db.session import get_db
import asyncio
from datetime import datetime, timezone


class GamificationSyncWorker:
    """
    Principal Architect: Periodic Batch Synchronization Worker.
    Ensures Redis-to-PostgreSQL consistency with transaction safety.
    """
    def __init__(self, interval_seconds: int = 300):
        self.interval = interval_seconds
        self.is_running = False

    async def start_perpetual_sync(self):
        """
        Starts the infinite loop for background synchronization.
        """
        self.is_running = True
        print(f"SyncWorker: Initialized with {self.interval}s interval.")

        while self.is_running:
            await asyncio.sleep(self.interval)
            await self.execute_batch_sync()

    async def execute_batch_sync(self):
        """
        Extracts all users from Redis and flushes to PostgreSQL.
        ACID compliant via SQLAlchemy transaction management.
        """
        print(f"SyncWorker: Starting batch sync at {datetime.now(timezone.utc)}")

        # Initialize DB session via generator
        db: Session = next(get_db())

        try:
            # Leverage the centralized gamification manager's ACID sync function
            # Imported here to avoid circular imports at module load time
            from app.services.gamification_manager import gamification_manager
            gamification_manager.sync_all_users_to_db(db)
        except Exception as e:
            print(f"SyncWorker CRITICAL ERROR: Batch update failed. {e}")
        finally:
            db.close()


sync_worker = GamificationSyncWorker()
