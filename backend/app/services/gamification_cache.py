from typing import Optional

from app.core.redis_client import get_redis
from app.schemas.gamification import UserCacheState


class GamificationCache:
    """
    Principal Architect: High-frequency Redis utility layer.
    Handles atomic operations for XP, Streaks, and Leaderboards.
    """

    def __init__(self):
        self.redis = get_redis()
        self.STATS_PREFIX = "kmastery:user"
        self.LEADERBOARD_KEY = "kmastery:leaderboard:global"

    def _get_key(self, user_id: str) -> str:
        return f"{self.STATS_PREFIX}:{user_id}:stats"

    def set_xp(self, user_id: str, amount: int):
        """
        Increments user XP atomically in Redis memory.
        Redis Command: HINCRBY - O(1) complexity.
        """
        key = self._get_key(user_id)
        # Atomic increment of the 'xp' field in the user's hash
        new_xp = self.redis.hincrby(key, "xp", amount)
        print(f"Redis: User {user_id} XP incremented to {new_xp}")

        # After updating XP, we must trigger leaderboard sync
        self.update_leaderboard(user_id, amount)
        return new_xp

    def get_streak(self, user_id: str) -> int:
        """
        Retrieves current streak from Redis.
        Redis Command: HGET - O(1) complexity.
        """
        key = self._get_key(user_id)
        streak = self.redis.hget(key, "streak")
        return int(streak) if streak else 0

    def update_leaderboard(self, user_id: str, score_delta: int):
        """
        Updates the global leaderboard Sorted Set.
        Redis Command: ZINCRBY - O(log(N)) complexity.
        """
        # Atomically increment the user's score in the leaderboard
        # This keeps the rankings live without needing SQL queries.
        self.redis.zincrby(self.LEADERBOARD_KEY, score_delta, str(user_id))
        print(f"Redis: Global leaderboard updated for User {user_id}")

    def get_full_state(self, user_id: str) -> Optional[UserCacheState]:
        """
        Returns the full Pydantic-validated state from Redis.
        """
        key = self._get_key(user_id)
        data = self.redis.hgetall(key)
        if not data:
            return None

        return UserCacheState(
            user_id=user_id,
            xp=int(data.get("xp", 0)),
            streak=int(data.get("streak", 0)),
            coins=int(data.get("coins", 0)),
            last_login=data.get("last_login", ""),
        )


gamification_cache = GamificationCache()
