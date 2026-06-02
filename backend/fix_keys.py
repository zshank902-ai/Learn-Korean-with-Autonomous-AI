import os, glob

files = [
    'app/services/tutor.py',
    'app/services/corrector.py',
    'app/services/memory_worker.py',
    'app/services/ai_analyzer.py',
    'app/api/v1/endpoints/hangul.py',
    'app/api/v1/endpoints/speech.py'
]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'from app.core.ai_config import get_groq_api_key' not in content:
        content = content.replace('import os', 'import os\nfrom app.core.ai_config import get_groq_api_key', 1)
        
    content = content.replace('os.getenv("GROQ_API_KEY", "")', 'get_groq_api_key()')
    content = content.replace('os.getenv("GROQ_API_KEY")', 'get_groq_api_key()')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Fixed files.')
