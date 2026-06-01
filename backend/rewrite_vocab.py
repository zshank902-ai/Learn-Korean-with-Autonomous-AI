import re

with open("app/api/v1/endpoints/vocab.py", "r", encoding="utf-8") as f:
    content = f.read()

# Replace GROQ_API_KEY imports with get_groq_api_key
content = content.replace('GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")',
                          'from app.core.ai_config import get_groq_api_key')

# Add OLLAMA variables
if 'OLLAMA_URL' not in content:
    content = content.replace(
        'GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"',
        'GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"\nOLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")\nOLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")'
    )

new_func = """def _get_or_generate_examples(words: List[str], level: int) -> dict:
    examples_map = {}
    redis = None
    try:
        redis = get_redis()
        cache_key = f"vocab:examples:v4:level{level}"
        cached = redis.get(cache_key)
        if cached:
            examples_map = json.loads(cached)
    except Exception as e:
        print(f"Redis unavailable for reading examples: {e}")

    missing_words = [w for w in words if w not in examples_map]
    if missing_words:
        system_prompt = (
            "You are a strict TOPIK Korean teacher. Provide a simple example sentence for each Korean word provided. "
            "CRITICAL REQUIREMENT: You MUST include the exact Korean word (or its grammatically conjugated root) in the Korean sentence. "
            "You MUST also provide the Revised Romanization for the target word. "
            "Return ONLY a JSON object mapping each word exactly to its example and romanization, with NO markdown formatting, NO backticks. "
            'Format Example: {"가다": {"korean": "학교에 가요.", "english": "I go to school.", "romanization": "gada"}}'
        )

        batch_size = 10
        for i in range(0, len(missing_words), batch_size):
            batch = missing_words[i:i+batch_size]
            import time
            max_retries = 3
            success = False

            groq_key = get_groq_api_key()
            if groq_key:
                for attempt in range(max_retries):
                    try:
                        res = requests.post(
                            GROQ_URL,
                            headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                            json={
                                "model": "llama-3.1-8b-instant",
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": json.dumps(batch, ensure_ascii=False)}
                                ],
                                "response_format": {"type": "json_object"},
                                "temperature": 0.3,
                                "max_tokens": 1000
                            },
                            timeout=15
                        )

                        if res.status_code == 429:
                            print(f"Rate limited on attempt {attempt+1}, sleeping...")
                            time.sleep(2 ** attempt)
                            # Pick a new key on retry
                            groq_key = get_groq_api_key()
                            continue

                        res.raise_for_status()
                        content_str = res.json()["choices"][0]["message"]["content"].strip()

                        if content_str.startswith("```json"): content_str = content_str[7:]
                        if content_str.startswith("```"): content_str = content_str[3:]
                        if content_str.endswith("```"): content_str = content_str[:-3]

                        new_examples = json.loads(content_str.strip())
                        success = True
                        break
                    except Exception as e:
                        if attempt == max_retries - 1:
                            print(f"Groq example generation failed after 3 attempts: {e}")
                        time.sleep(2 ** attempt)
                        groq_key = get_groq_api_key()

            # Fallback to Ollama if Groq failed or key is missing
            if not success:
                print("Falling back to Ollama for flashcards...")
                try:
                    res = requests.post(
                        f"{OLLAMA_URL}/api/generate",
                        json={
                            "model": OLLAMA_MODEL,
                            "prompt": f"{system_prompt}\\n\\nInput: {json.dumps(batch, ensure_ascii=False)}",
                            "stream": False,
                            "format": "json"
                        },
                        timeout=30
                    )
                    res.raise_for_status()
                    new_examples = json.loads(res.json().get("response", "{}"))
                    success = True
                except Exception as e:
                    print(f"Ollama fallback failed: {e}")
                    new_examples = {}

            # Apply structure check and absolute worst-case fallback
            for word in batch:
                ex = new_examples.get(word)
                if not (ex and isinstance(ex, dict) and "korean" in ex and "english" in ex):
                    new_examples[word] = {
                        "korean": f"'{word}' 단어를 사용해 보세요.",
                        "english": f"Try practicing the word '{word}'.",
                        "romanization": word
                    }
                elif "romanization" not in new_examples[word]:
                    new_examples[word]["romanization"] = word

            examples_map.update(new_examples)
            try:
                if redis:
                    redis.set(cache_key, json.dumps(examples_map, ensure_ascii=False))
            except Exception as e:
                print(f"Redis unavailable for saving examples: {e}")

    return examples_map"""

# Use regex to replace the function definition completely
pattern = re.compile(
    r"def _get_or_generate_examples\(words: List\[str\], level: int\) -> dict:.*?(?=\n@router\.get\(\"/flashcards\")", re.DOTALL)
content = pattern.sub(new_func + "\n", content)

# Fix fallback in get_daily_flashcards
fallback_pattern = re.compile(
    r'ex = \{"korean": f"이것은 \{item\.word\}의 예문입니다\.", "english": f"This is an example for \{item\.word\}\."\}')
content = fallback_pattern.sub(
    'ex = {"korean": f"\'{item.word}\' 단어를 연습하세요.", "english": f"Practice the word \'{item.word}\'.", "romanization": item.word}', content)

with open("app/api/v1/endpoints/vocab.py", "w", encoding="utf-8") as f:
    f.write(content)
print("vocab.py successfully updated.")
