import json
import os

input_path = r'd:\Python Workshop\K-Mastery\전체 내려받기_한국어기초사전_json_20260529\1_5000_20260529.json'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

entries = data.get('LexicalResource', {}).get('Lexicon', {}).get('LexicalEntry', [])
if isinstance(entries, dict): entries = [entries]

total_entries = len(entries)
has_english_meaning = 0
has_korean_example = 0
has_english_example = 0

print(f"Total entries in this file: {total_entries}")

def normalize_list(item):
    if item is None: return []
    if isinstance(item, list): return item
    return [item]

for entry in entries:
    found_eng = False
    found_kr_ex = False
    found_en_ex = False
    
    senses = normalize_list(entry.get("Sense"))
    for sense in senses:
        if not isinstance(sense, dict): continue
        
        # Check for English Equivalent
        equivs = normalize_list(sense.get("Equivalent"))
        for equiv in equivs:
            if not isinstance(equiv, dict): continue
            feats = normalize_list(equiv.get("feat"))
            is_english = any(f.get("att") == "language" and f.get("val") == "영어" for f in feats if isinstance(f, dict))
            if is_english:
                found_eng = True
                
        # Check for Examples
        examples = normalize_list(sense.get("SenseExample"))
        for ex in examples:
            if not isinstance(ex, dict): continue
            feats = normalize_list(ex.get("feat"))
            
            for f in feats:
                if not isinstance(f, dict): continue
                if f.get("att") == "example":
                    found_kr_ex = True
                if f.get("att") in ["translation", "english"]:
                    found_en_ex = True
                    
    if found_eng: has_english_meaning += 1
    if found_kr_ex: has_korean_example += 1
    if found_en_ex: has_english_example += 1

print(f"Entries with English Meaning: {has_english_meaning} ({(has_english_meaning/total_entries)*100:.1f}%)")
print(f"Entries with Korean Example : {has_korean_example} ({(has_korean_example/total_entries)*100:.1f}%)")
print(f"Entries with English Example Translation: {has_english_example} ({(has_english_example/total_entries)*100:.1f}%)")
