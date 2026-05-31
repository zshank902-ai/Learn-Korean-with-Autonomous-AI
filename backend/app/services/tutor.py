import os
import json
import httpx
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")

def get_system_prompt(topik_level: int, long_term_memory: str = None, is_exam: bool = False, tsv_words: list = None) -> str:
    if is_exam:
        next_level = topik_level + 1
        return f"""You are a strict TOPIK (Test of Proficiency in Korean) Examiner. 
The user is currently at TOPIK Level {topik_level} and wishes to unlock TOPIK Level {next_level}.

Your objective is to conduct a 3-question oral exam to determine if they are ready to advance.
RULES:
1. Ask one question at a time. The questions must strictly match the grammar and vocabulary difficulty of TOPIK Level {topik_level}.
2. Wait for the user's response before asking the next question.
3. If the user makes critical grammatical errors or uses vocabulary that is too basic, fail them immediately and explain what they need to study.
4. If they answer all 3 questions perfectly natively, output a special JSON payload: {{"status": "PASS", "message": "Congratulations! You have unlocked the next level."}}

CRITICAL INSTRUCTION:
You MUST output your response in strict JSON format matching exactly this schema:
{{
  "response": "Your Korean chat reply or exam question goes here."
}}
If the user passes the exam on the 3rd question, the JSON MUST be:
{{
  "status": "PASS",
  "message": "Congratulations! You have unlocked the next level."
}}
"""

    level_instruction = ""
    if topik_level == 1:
        level_instruction = "Use extremely simple vocabulary (Survival Korean). Romanization is allowed for difficult words. Speak slowly and use lots of English explanations."
    elif topik_level == 2:
        level_instruction = "Use daily life vocabulary. Keep sentences short. Minimize Romanization."
    elif topik_level == 3:
        level_instruction = "Use intermediate vocabulary (Social Integration). Speak mostly in Korean. Use English only for complex grammar explanations."
    elif topik_level >= 4:
        level_instruction = "Use advanced vocabulary and professional Korean. Speak 100% in Korean. Do not use English unless the user explicitly asks for a translation."

    memory_instruction = ""
    if long_term_memory:
        memory_instruction = f"5. USER CONTEXT / MEMORY: {long_term_memory}. Use this to personalize the conversation!"

    tsv_instruction = ""
    if tsv_words:
        words_str = ", ".join(tsv_words)
        tsv_instruction = f"6. SURVIVAL VOCABULARY: You MUST naturally guide the conversation to utilize these specific vocabulary words: [{words_str}]. Try to use at least one in your next response to force the user to learn it."

    return f"""You are an expert AI Korean language tutor. 
Your goal is to help the user practice Korean conversation. 
RULES:
1. Converse natively in Korean, matching the user's apparent skill level.
2. If the user makes a grammatical or spelling mistake in Korean, gently correct them.
3. Keep your responses encouraging and concise. Do not write long essays.
4. {level_instruction}
{memory_instruction}
{tsv_instruction}

CRITICAL INSTRUCTION:
You MUST output your response in strict JSON format matching exactly this schema:
{{
  "response": "Your Korean chat reply goes here.",
  "has_corrections": true/false,
  "corrections": [
    {{
      "original": "The user's incorrect phrase",
      "corrected": "The corrected phrase",
      "explanation": "Brief explanation in English of why it was wrong.",
      "rule_category": "e.g., Spelling, Grammar, Politeness Level"
    }}
  ]
}}
If there are no mistakes, set has_corrections to false and corrections to [].
"""

class TutorService:
    async def async_stream_chat(self, history: list, topik_level: int = 1, long_term_memory: str = None, is_exam: bool = False, tsv_words: list = None) -> AsyncGenerator[dict, None]:
        """
        Streams chat responses from Groq (Llama-3).
        Yields dicts: {"type": "stream", "chunk": "..."} or {"type": "corrections", "data": [...]}
        """
        processed_history = []
        for msg in history:
            role = msg.get("role", "user")
            if role == "ai":
                role = "assistant"
            processed_history.append({"role": role, "content": msg.get("content", "")})

        messages = [{"role": "system", "content": get_system_prompt(topik_level, long_term_memory, is_exam, tsv_words)}] + processed_history

        if GROQ_API_KEY:
            try:
                async for event in self._stream_groq_json(messages):
                    yield event
                return
            except Exception as e:
                print(f"TutorService: Groq API failed ({e}), falling back to local Ollama...")

        # Fallback to Local Ollama
        try:
            async for chunk in self._stream_ollama(messages):
                yield {"type": "stream", "chunk": chunk}
            return
        except Exception as e:
            print(f"TutorService: Ollama Unexpected error — {e}")

        # Final Fallback to Mock Developer Mode
        import asyncio
        mock_response = "안녕하세요! (Offline Mode) Please add GROQ_API_KEY to your backend .env file to enable the real AI Tutor!"
        for char in mock_response:
            yield {"type": "stream", "chunk": char}
            await asyncio.sleep(0.05)

    async def _stream_groq_json(self, messages: list) -> AsyncGenerator[dict, None]:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1024,
            "stream": True,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            async with client.stream("POST", GROQ_URL, headers=headers, json=payload) as response:
                response.raise_for_status()
                
                # Custom JSON Stream Parser to extract "response" string in real-time
                buffer = ""
                in_response_string = False
                response_content = ""
                escaped = False

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0].get("delta", {})
                            if "content" in delta:
                                chunk = delta["content"]
                                buffer += chunk
                                
                                # Highly robust parsing to extract the "response" field value dynamically
                                # We wait until we see '"response": "' and then stream characters until the unescaped closing quote.
                                if not in_response_string:
                                    # Check if we reached the start of the response string
                                    # Using a simple heuristic: if we find "response": " we start.
                                    # Since JSON keys might have spaces, we can clean up the buffer mentally.
                                    clean_buf = buffer.replace(" ", "").replace("\\n", "").replace("\\r", "")
                                    if '"response":"' in clean_buf:
                                        in_response_string = True
                                        # Extract anything already captured after the quote
                                        start_idx = buffer.find('"response"')
                                        quote_idx = buffer.find('"', start_idx + 10)
                                        if quote_idx != -1:
                                            # We found the starting quote of the value.
                                            # The rest of the buffer is the content.
                                            content_so_far = buffer[quote_idx+1:]
                                            # Need to handle if the closing quote is already in content_so_far
                                            # But since we just started, we'll process it character by character.
                                            buffer = content_so_far # Reset buffer to just be the content
                                
                                if in_response_string:
                                    # We are inside the response string. We need to yield characters and watch for closing quote.
                                    i = 0
                                    chunk_to_yield = ""
                                    while i < len(buffer):
                                        c = buffer[i]
                                        if escaped:
                                            escaped = False
                                            chunk_to_yield += c
                                        elif c == '\\':
                                            escaped = True
                                            chunk_to_yield += c
                                        elif c == '"':
                                            # End of response string!
                                            in_response_string = False
                                            break
                                        else:
                                            chunk_to_yield += c
                                        i += 1
                                    
                                    # Yield the delta of what we just parsed
                                    if chunk_to_yield:
                                        # unescape simple json escapes for streaming display
                                        display_text = chunk_to_yield.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
                                        yield {"type": "stream", "chunk": display_text}
                                    
                                    # Keep whatever is left in the buffer (including the closing quote and everything after)
                                    buffer = buffer[i:]

                        except json.JSONDecodeError:
                            pass
                
                # Stream finished. Now we parse the full JSON to extract corrections.
                try:
                    full_data = json.loads(buffer) if not in_response_string else {} # Fallback
                except:
                    # If the JSON is slightly malformed but we have the buffer, try to parse
                    try:
                        import ast
                        # Very aggressive fallback: find the corrections array using string manipulation if json fails
                        start = buffer.find('"corrections"')
                        if start != -1:
                            arr_start = buffer.find('[', start)
                            arr_end = buffer.rfind(']')
                            if arr_start != -1 and arr_end != -1:
                                arr_str = buffer[arr_start:arr_end+1]
                                corrections = json.loads(arr_str)
                                yield {"type": "corrections", "data": corrections}
                                return
                    except:
                        pass
                    return

                if full_data.get("has_corrections") and "corrections" in full_data:
                    yield {"type": "corrections", "data": full_data["corrections"]}

    async def _stream_ollama(self, messages: list) -> AsyncGenerator[str, None]:
        payload = {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": 0.5,
                "num_predict": 512,
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "message" in data and "content" in data["message"]:
                                yield data["message"]["content"]
                        except json.JSONDecodeError:
                            pass

tutor_service = TutorService()
