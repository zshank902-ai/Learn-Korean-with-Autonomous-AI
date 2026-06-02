import json
import os

folder = "d:/Python Workshop/K-Mastery/전체 내려받기_한국어기초사전_json_20260529"
total_words = 0
total_with_en = 0

for file in os.listdir(folder):
    if not file.endswith(".json"): continue
    path = os.path.join(folder, file)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        entries = data.get("LexicalResource", {}).get("LexicalEntry", [])
        if isinstance(entries, dict): entries = [entries]
        
        for entry in entries:
            total_words += 1
            has_en = False
            senses = entry.get("senseInfo")
            if senses:
                if isinstance(senses, dict): senses = [senses]
                for sense in senses:
                    equivs = sense.get("translationInfo")
                    if equivs:
                        if isinstance(equivs, dict): equivs = [equivs]
                        for eq in equivs:
                            if eq.get("language") == "영어":
                                has_en = True
                                break
                    if has_en: break
            if has_en:
                total_with_en += 1

print(f"Total Words in NIKL: {total_words}")
print(f"Total Words with English translation: {total_with_en}")
