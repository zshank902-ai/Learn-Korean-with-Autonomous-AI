import re

filepath = r"d:\Python Workshop\K-Mastery\backend\app\services\roadmap_service.py"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Change playground to flashcard for hangul-basics
content = re.sub(
    r'("id":\s*"hangul-basics",.*?)"type":\s*"playground"',
    r'\1"type": "flashcard"',
    content,
    flags=re.DOTALL,
)

# Remove all prerequisites
content = re.sub(r'"prerequisite":\s*"[^"]+"',
                 r'"prerequisite": None', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Done!")
