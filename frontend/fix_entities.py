import json
import re

def fix_entities():
    with open('eslint_report2.json', 'r', encoding='utf-16') as f:
        data = json.load(f)

    for file_data in data:
        file_path = file_data.get('filePath')
        messages = file_data.get('messages', [])
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        changed = False
        
        # First, remove any line that contains "eslint-disable-next-line react/no-unescaped-entities"
        new_lines = []
        for line in lines:
            if 'eslint-disable-next-line react/no-unescaped-entities' in line or 'eslint-disable-next-line react/jsx-no-comment-textnodes' in line:
                changed = True
                continue
            if 'eslint-disable-next-line' in line and ('react-hooks/exhaustive-deps' not in line and 'react-hooks/rules-of-hooks' not in line and 'react-hooks/set-state-in-effect' not in line and '@typescript-eslint' not in line):
                # if it ONLY has react/jsx-no-comment-textnodes or unescaped-entities, drop it
                pass
            new_lines.append(line)
        lines = new_lines
        
        # We need to apply fixes from bottom to top, right to left to avoid shifting
        # But for column replacements on the same line, we sort by column descending
        fixes = []
        for msg in messages:
            if msg.get('ruleId') == 'react/no-unescaped-entities':
                line = msg.get('line')
                col = msg.get('column')
                msg_text = msg.get('message', '')
                
                # Extract which char it is
                if '`"`' in msg_text:
                    char_to_escape = '"'
                    escape_seq = '&quot;'
                elif '`\'`' in msg_text:
                    char_to_escape = "'"
                    escape_seq = '&apos;'
                else:
                    char_to_escape = None
                    
                if char_to_escape:
                    fixes.append((line, col, char_to_escape, escape_seq))
                    
        # Sort by line desc, then col desc
        fixes.sort(key=lambda x: (x[0], x[1]), reverse=True)
        
        for line_num, col, char_to_escape, escape_seq in fixes:
            idx = line_num - 1
            if idx >= len(lines): continue
            
            line_str = lines[idx]
            col_idx = col - 1
            
            # double check if the char is actually there
            if col_idx < len(line_str) and line_str[col_idx] == char_to_escape:
                lines[idx] = line_str[:col_idx] + escape_seq + line_str[col_idx+1:]
                changed = True
                
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
                
    # Also remove Unused eslint-disable directive
    for file_data in data:
        file_path = file_data.get('filePath')
        messages = file_data.get('messages', [])
        lines_to_remove = set()
        for msg in messages:
            if 'Unused eslint-disable directive' in msg.get('message', ''):
                lines_to_remove.add(msg.get('line'))
        
        if lines_to_remove:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            new_lines = [line for i, line in enumerate(lines) if (i+1) not in lines_to_remove]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)


if __name__ == "__main__":
    fix_entities()
