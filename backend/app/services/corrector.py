import asyncio
import json
import os
from app.core.ai_config import get_groq_api_key
from functools import partial

import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq / Ollama Configuration
GROQ_API_KEY = get_groq_api_key()
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")


class SentenceCorrector:
    """
    Production Grammar Corrector powered primarily by Groq (Llama-3 Cloud).
    Falls back gracefully to local Ollama (Phi-3) if Groq key is missing or offline.
    """

    def _build_prompt(self, sentence: str) -> str:
        return (
            f"You are a strict and highly accurate Korean language professor.\n"
            f"Analyze the following Korean sentence, correct any grammar, spelling, or politeness mistakes, and make it sound natural.\n\n"
            f'Korean sentence: "{sentence}"\n\n'
            f"Respond ONLY with a valid JSON object in this exact format:\n"
            f"{{\n"
            f'  "corrected": "<the corrected Korean sentence>",\n'
            f'  "explanation": "<brief explanation in English of what was corrected and why>"\n'
            f"}}"
        )

    def _call_groq_sync(self, sentence: str) -> dict:
        """
        Synchronous Groq Cloud API call using requests.
        """
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You output strictly valid JSON."},
                {"role": "user", "content": self._build_prompt(sentence)},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 256,
        }

        response = requests.post(
            GROQ_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()

        result_data = response.json()
        content = result_data["choices"][0]["message"]["content"]
        result = json.loads(content)

        return {
            "original": sentence,
            "corrected": result.get("corrected", sentence),
            "explanation": result.get("explanation", "No issues found."),
            "confidence": 0.98,
            "model": GROQ_MODEL,
        }

    def _call_ollama_sync(self, sentence: str) -> dict:
        """
        Fallback Synchronous Ollama call using requests.
        """
        prompt = self._build_prompt(sentence)
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.3,
                "num_predict": 256,
            },
        }

        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=60
        )
        response.raise_for_status()

        ollama_data = response.json()
        result = json.loads(ollama_data["response"])

        return {
            "original": sentence,
            "corrected": result.get("corrected", sentence),
            "explanation": result.get("explanation", "No issues found."),
            "confidence": 0.95,
            "model": OLLAMA_MODEL,
        }

    def get_correction(self, sentence: str) -> dict:
        """
        Synchronous fallback used when both models are unavailable.
        """
        return {
            "original": sentence,
            "corrected": sentence,
            "explanation": "AI corrector is warming up or unavailable. Please try again in a moment.",
            "confidence": 0.0,
            "model": "fallback",
        }

    async def async_get_correction(self, sentence: str) -> dict:
        """
        Non-blocking async correction. Tries Groq Cloud first.
        If it fails or the key is missing, falls back to local Ollama.
        """
        loop = asyncio.get_running_loop()

        # 1. Try Groq (Fastest, Cloud)
        if GROQ_API_KEY:
            try:
                return await loop.run_in_executor(
                    None, partial(self._call_groq_sync, sentence)
                )
            except Exception as e:
                print(
                    f"Corrector: Groq API failed ({e}), falling back to local Ollama..."
                )
        else:
            print("Corrector: GROQ_API_KEY missing, using local Ollama (Phi-3).")

        # 2. Try Local Ollama (Phi-3)
        try:
            return await loop.run_in_executor(
                None, partial(self._call_ollama_sync, sentence)
            )
        except requests.exceptions.ConnectionError:
            print(f"Corrector: Ollama not reachable at {OLLAMA_BASE_URL}.")
        except Exception as e:
            print(f"Corrector: Ollama Unexpected error — {e}")

        # 3. Fallback
        return self.get_correction(sentence)


corrector_service = SentenceCorrector()
