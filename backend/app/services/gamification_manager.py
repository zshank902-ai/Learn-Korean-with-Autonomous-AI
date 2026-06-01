from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Union
import uuid

from sqlalchemy.orm import Session

from app.core.redis_client import get_redis


class GamificationManager:
    """
    Principal Architect: Redis-backed Gamification Engine.
    Handles high-concurrency XP, Leaderboards, and Streaks.
    """

    def __init__(self):
        self.redis = get_redis()
        # Schema Definitions
        self.USER_STATS_PREFIX = "kmastery:user"
        self.LEADERBOARD_GLOBAL = "kmastery:leaderboard:global"
        self.LEADERBOARD_LEVEL_PREFIX = "kmastery:leaderboard:level"

    def _get_user_key(self, user_id: Union[str, uuid.UUID]) -> str:
        return f"{self.USER_STATS_PREFIX}:{user_id}:stats"

    def initialize_user_stats(self, user_id: Union[str, uuid.UUID]):
        user_key = self._get_user_key(user_id)
        self.redis.hsetnx(user_key, "xp", 0)
        self.redis.hsetnx(user_key, "streak", 0)
        self.redis.hsetnx(user_key, "coins", 0)
        self.redis.hsetnx(user_key, "level", 1)
        self.redis.hsetnx(
            user_key, "last_login", datetime.now(timezone.utc).isoformat()
        )

    def get_user_stats(self, user_id: Union[str, uuid.UUID]) -> Dict:
        user_key = self._get_user_key(user_id)
        stats = self.redis.hgetall(user_key)
        if not stats:
            self.initialize_user_stats(user_id)
            return self.get_user_stats(user_id)
        return stats

    def update_stat(self, user_id: Union[str, uuid.UUID], field: str, amount: int):
        user_key = self._get_user_key(user_id)
        new_val = self.redis.hincrby(user_key, field, amount)

        if field == "xp":
            # Update Global Leaderboard
            self.redis.zincrby(self.LEADERBOARD_GLOBAL, amount, str(user_id))
            # Update Level-Specific Leaderboard
            stats = self.get_user_stats(user_id)
            level = stats.get("level", 1)
            level_key = f"{self.LEADERBOARD_LEVEL_PREFIX}:{level}"
            self.redis.zincrby(level_key, amount, str(user_id))

        return int(new_val)

    def get_leaderboard(
        self, level: Optional[int] = None, limit: int = 10
    ) -> List[Dict]:
        """
        High-performance leaderboard retrieval.
        Supports Global or Level-specific filtering.
        """
        key = (
            f"{self.LEADERBOARD_LEVEL_PREFIX}:{level}"
            if level
            else self.LEADERBOARD_GLOBAL
        )
        raw_data = self.redis.zrevrange(key, 0, limit - 1, withscores=True)

        leaderboard = []
        for i, (u_id, score) in enumerate(raw_data):
            leaderboard.append(
                {"rank": i + 1, "user_id": u_id, "xp": int(score)})
        return leaderboard

    def get_user_rank(self, user_id: Union[str, uuid.UUID], level: Optional[int] = None) -> int:
        """
        Retrieves the user's exact rank in O(log N) time.
        """
        key = (
            f"{self.LEADERBOARD_LEVEL_PREFIX}:{level}"
            if level
            else self.LEADERBOARD_GLOBAL
        )
        rank = self.redis.zrevrank(key, str(user_id))
        return (rank + 1) if rank is not None else -1

    def handle_daily_login(self, user_id: Union[str, uuid.UUID]) -> Dict:
        user_key = self._get_user_key(user_id)
        stats = self.get_user_stats(user_id)
        last_login_str = stats.get("last_login")
        last_login = (
            datetime.fromisoformat(last_login_str)
            if last_login_str
            else datetime.now(timezone.utc)
        )
        now = datetime.now(timezone.utc)
        diff = now - last_login

        result = {"status": "maintained",
                  "current_streak": int(stats.get("streak", 0))}
        if diff > timedelta(hours=24) and diff < timedelta(hours=48):
            new_streak = self.update_stat(user_id, "streak", 1)
            result = {"status": "incremented", "current_streak": new_streak}
        elif diff >= timedelta(hours=48):
            self.redis.hset(user_key, "streak", 1)
            result = {"status": "reset", "current_streak": 1}

        self.redis.hset(user_key, "last_login", now.isoformat())
        return result

    def reward_session_coins(self, user_id: Union[str, uuid.UUID], milestone_type: str):
        rewards = {"lesson_complete": 10,
                   "quiz_perfect": 50, "daily_task_all": 100}
        amount = rewards.get(milestone_type, 5)
        return self.update_stat(user_id, "coins", amount)

    def get_leaderboard_mock(self, limit: int = 10) -> list:
        """
        Returns the real leaderboard from Redis.
        """
        real_lb = self.get_leaderboard(limit=limit)
        return real_lb if real_lb else []

    def sync_all_users_to_db(self, db: Session):
        """
        Principal Logic: Flushes Redis Hashes to PostgreSQL in a single transaction.
        Ensures ACID compliance during the batch-update process.
        """
        pattern = f"{self.USER_STATS_PREFIX}:*:stats"
        sync_count = 0

        print(f"MLOps: Starting Batch Sync at {datetime.now(timezone.utc)}")

        try:
            keys = self.redis.keys(pattern)
            for key in keys:
                try:
                    parts = key.split(":")
                    # Key format: kmastery:user:{user_id}:stats
                    user_id = parts[2]
                except (IndexError, ValueError):
                    print(f"MLOps WARNING: Invalid key format in Redis: {key}")
                    continue

                stats = self.redis.hgetall(key)
                if not stats:
                    continue

                # Update or Create UserProgress in PostgreSQL (Upsert)
                from app.models.user import UserProgress

                progress = (
                    db.query(UserProgress)
                    .filter(UserProgress.user_id == user_id)
                    .first()
                )

                total_xp = int(stats.get("xp", 0))
                streak_count = int(stats.get("streak", 0))
                current_level = int(stats.get("level", 1))

                if progress:
                    progress.total_xp = total_xp
                    progress.streak_count = streak_count
                    progress.current_topik_level = current_level
                else:
                    # If user exists but has no progress, create it
                    new_progress = UserProgress(
                        user_id=user_id,
                        total_xp=total_xp,
                        streak_count=streak_count,
                        current_topik_level=current_level,
                    )
                    db.add(new_progress)
                    progress = new_progress

                # Fetch roadmap progress from Redis and save to PostgreSQL
                import json

                roadmap_key = f"roadmap:progress:{user_id}"
                roadmap_raw = self.redis.hgetall(roadmap_key)
                if roadmap_raw:
                    roadmap_dict = {
                        (k.decode() if isinstance(k, bytes) else k): (
                            v.decode() if isinstance(v, bytes) else v
                        )
                        for k, v in roadmap_raw.items()
                    }
                    progress.roadmap_status_json = json.dumps(roadmap_dict)

                sync_count += 1

            db.commit()  # Single commit for the entire batch (ACID)
            print(
                f"MLOps: Successfully synced {sync_count} users to PostgreSQL.")
        except Exception as e:
            db.rollback()  # Explicit rollback on any failure
            print(
                f"MLOps CRITICAL ERROR: Batch sync failed. Transaction rolled back. Error: {e}"
            )
            raise e


gamification_manager = GamificationManager()
