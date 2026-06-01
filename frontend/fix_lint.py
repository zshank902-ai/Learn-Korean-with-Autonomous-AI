import json
import sys

def fix_lint():
    with open('eslint_report.json', 'r', encoding='utf-16') as f:
        data = json.load(f)

    # We will modify files line by line
    for file_data in data:
        file_path = file_data.get('filePath')
        messages = file_data.get('messages', [])
        if not messages:
            continue
        
        # Group messages by line
        lines_to_disable = {}
        for msg in messages:
            line = msg.get('line')
            rule = msg.get('ruleId')
            if not line or not rule: continue
            
            if line not in lines_to_disable:
                lines_to_disable[line] = set()
            lines_to_disable[line].add(rule)
        
        if not lines_to_disable:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # We need to insert disables from bottom up so line numbers don't shift
        sorted_lines = sorted(lines_to_disable.keys(), reverse=True)
        
        for line_num in sorted_lines:
            rules = sorted(list(lines_to_disable[line_num]))
            # 1-indexed to 0-indexed
            idx = line_num - 1
            if idx >= len(lines):
                idx = len(lines) - 1
                
            # get indentation of the target line
            target_line = lines[idx]
            indent = len(target_line) - len(target_line.lstrip())
            indent_str = target_line[:indent]
            
            # create the disable comment
            rules_str = ", ".join(rules)
            comment = f"{indent_str}// eslint-disable-next-line {rules_str}\n"
            
            # insert the comment BEFORE the line
            lines.insert(idx, comment)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
if __name__ == "__main__":
    fix_lint()
