import os
import random


def get_groq_api_key() -> str:
    """
    Returns a random Groq API key from GROQ_API_KEYS (comma-separated list).
    Falls back to GROQ_API_KEY if GROQ_API_KEYS is not set.
    """
    keys_str = os.getenv("GROQ_API_KEYS", "")
    if keys_str:
        keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        if keys:
            return random.choice(keys)
    return os.getenv("GROQ_API_KEY", "")
