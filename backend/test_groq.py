import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
words = ['오다', '가다', '먹다', '마시다', '보다', '자다', '일어나다', '하다', '만나다', '사다']

print('Testing Groq with 10 words...')
system_prompt = (
    "You are a strict TOPIK Korean teacher. Provide a simple example sentence for each Korean word provided. "
    "CRITICAL REQUIREMENT: You MUST include the exact Korean word (or its grammatically conjugated root) in the Korean sentence. "
    "Do not hallucinate random sentences. "
    "Return ONLY a JSON object mapping each word exactly to its example, with NO markdown formatting, NO backticks, and NO explanations. "
    'Format Example: {"가다": {"korean": "학교에 가요.", "english": "I go to school."}}'
)

res = requests.post(
    GROQ_URL, 
    headers={'Authorization': f'Bearer {GROQ_API_KEY}', 'Content-Type': 'application/json'}, 
    json={
        'model': 'llama-3.1-8b-instant', 
        'messages': [
            {'role': 'system', 'content': system_prompt}, 
            {'role': 'user', 'content': json.dumps(words, ensure_ascii=False)}
        ], 
        'response_format': {'type': 'json_object'}, 
        'temperature': 0.3, 
        'max_tokens': 4000
    }, 
    timeout=15
)
print("Status Code:", res.status_code)
with open("test_groq_out.txt", "w", encoding="utf-8") as f:
    f.write(res.text)
