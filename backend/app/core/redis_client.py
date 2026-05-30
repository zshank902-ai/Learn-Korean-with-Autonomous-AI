import redis
import os
from app.core.config import settings


class MockRedis:
    """
    Full in-memory Redis mock for local development without a Redis server.
    Implements all methods used across the K-Mastery codebase.
    """
    def __init__(self):
        self.data: dict = {}
        self.sorted_sets: dict = {}

    def ping(self) -> bool:
        return True

    # String commands
    def get(self, key: str):
        return self.data.get(key)

    def set(self, key: str, value) -> bool:
        self.data[key] = str(value)
        return True

    # Hash commands
    def hset(self, name: str, key: str, value) -> int:
        if name not in self.data:
            self.data[name] = {}
        self.data[name][key] = str(value)
        return 1

    def hsetnx(self, name: str, key: str, value) -> int:
        """Set field only if it does not exist."""
        if name not in self.data:
            self.data[name] = {}
        if key not in self.data[name]:
            self.data[name][key] = str(value)
            return 1
        return 0

    def hget(self, name: str, key: str):
        return self.data.get(name, {}).get(key)

    def hgetall(self, name: str) -> dict:
        return dict(self.data.get(name, {}))

    def hincrby(self, name: str, key: str, amount: int) -> int:
        if name not in self.data:
            self.data[name] = {}
        current = int(self.data[name].get(key, 0))
        new_val = current + amount
        self.data[name][key] = str(new_val)
        return new_val

    # Sorted set commands
    def zadd(self, name: str, mapping: dict) -> int:
        if name not in self.sorted_sets:
            self.sorted_sets[name] = {}
        self.sorted_sets[name].update(mapping)
        return len(mapping)

    def zincrby(self, name: str, amount: float, value: str) -> float:
        if name not in self.sorted_sets:
            self.sorted_sets[name] = {}
        current = self.sorted_sets[name].get(value, 0.0)
        new_score = current + amount
        self.sorted_sets[name][value] = new_score
        return new_score

    def zrevrange(self, name: str, start: int, end: int, withscores: bool = False):
        ss = self.sorted_sets.get(name, {})
        sorted_items = sorted(ss.items(), key=lambda x: x[1], reverse=True)
        if end == -1:
            sliced = sorted_items[start:]
        else:
            sliced = sorted_items[start:end + 1]
        if withscores:
            return sliced
        return [item[0] for item in sliced]

    def zrevrank(self, name: str, value: str):
        ss = self.sorted_sets.get(name, {})
        sorted_items = sorted(ss.items(), key=lambda x: x[1], reverse=True)
        for i, (k, _) in enumerate(sorted_items):
            if k == value:
                return i
        return None

    # Key commands
    def keys(self, pattern: str) -> list:
        """Basic pattern matching: supports prefix* patterns."""
        if pattern.endswith("*"):
            prefix = pattern[:-1]
            return [k for k in self.data.keys() if k.startswith(prefix)]
        return [k for k in self.data.keys() if k == pattern]


# Principal Architect: Centralized Redis Connection Pool
# Provides high-performance access to the real-time gamification state.
try:
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True
    )
    # Ping to check connection
    redis_client.ping()
    print("Redis: Connection pool initialized.")
except Exception as e:
    print(f"Redis: Connection failed (using mock mode). Error: {e}")
    redis_client = MockRedis()


def get_redis():
    return redis_client
