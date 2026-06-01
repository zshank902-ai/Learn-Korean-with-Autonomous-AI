import json
import re

def fix_jsx_comments():
    with open('eslint_report2.json', 'r', encoding='utf-16') as f:
        data = json.load(f)

    for file_data in data:
        file_path = file_data.get('filePath')
        messages = file_data.get('messages', [])
        
        # find lines that have react/jsx-no-comment-textnodes
        bad_lines = set()
        for msg in messages:
            if msg.get('ruleId') == 'react/jsx-no-comment-textnodes':
                bad_lines.add(msg.get('line'))
                
        if not bad_lines:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        changed = False
        for line_num in bad_lines:
            idx = line_num - 1
            if idx >= len(lines): continue
            
            line_str = lines[idx]
            # Replace // eslint-disable-next-line ... with {/* eslint-disable-next-line ... */}
            if '// eslint-disable-next-line' in line_str:
                lines[idx] = re.sub(r'//\s*(eslint-disable-next-line.*)', r'{/* \1 */}', line_str)
                changed = True
                
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)

if __name__ == "__main__":
    fix_jsx_comments()
