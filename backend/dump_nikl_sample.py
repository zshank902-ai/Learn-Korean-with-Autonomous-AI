import json

input_path = r'd:\Python Workshop\K-Mastery\전체 내려받기_한국어기초사전_json_20260529\1_5000_20260529.json'
output_path = r'd:\Python Workshop\K-Mastery\backend\temp_sample.json'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

first_entry = data['LexicalResource']['Lexicon']['LexicalEntry'][0]

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(first_entry, f, indent=2, ensure_ascii=False)
