import json
import os

input_path = r'd:\Python Workshop\K-Mastery\전체 내려받기_한국어기초사전_json_20260529\1_5000_20260529.json'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

entries = data.get('LexicalResource', {}).get('Lexicon', {}).get('LexicalEntry', [])
if isinstance(entries, dict): entries = [entries]

total_entries = len(entries)
has_audio = 0

def normalize_list(item):
    if item is None: return []
    if isinstance(item, list): return item
    return [item]

for entry in entries:
    found_audio = False
    
    word_forms = normalize_list(entry.get("WordForm"))
    for wf in word_forms:
        if not isinstance(wf, dict): continue
        feats = normalize_list(wf.get("feat"))
        for f in feats:
            if isinstance(f, dict) and f.get("att") == "sound":
                found_audio = True
                break
        if found_audio: break
        
    if found_audio:
        has_audio += 1

print(f"Total entries: {total_entries}")
print(f"Entries with official .wav audio: {has_audio} ({(has_audio/total_entries)*100:.1f}%)")
