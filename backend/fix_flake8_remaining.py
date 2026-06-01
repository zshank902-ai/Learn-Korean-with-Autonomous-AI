import re
import os

def fix_file(path, fixes):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line_num, fix_type in fixes:
        idx = line_num - 1
        if idx >= len(lines): continue
            
        if fix_type == 'fstring':
            lines[idx] = re.sub(r'f([\'"])', r'\1', lines[idx])
        elif fix_type == 'trailing_space':
            lines[idx] = lines[idx].rstrip() + '\n'
        elif fix_type == 'l_var':
            lines[idx] = re.sub(r'\bl\b', 'level', lines[idx])
        elif fix_type == 'bare_except':
            lines[idx] = lines[idx].replace('except:', 'except Exception:')
        elif fix_type == 'blank_lines':
            lines[idx] = ''
        elif fix_type == 'redef':
            lines[idx] = '' # just drop the import or line
        elif fix_type == 'unused_var':
            lines[idx] = lines[idx].replace('response =', '_ =')
            
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def main():
    fixes = {
        r'd:\Python Workshop\K-Mastery\backend\app\api\v1\endpoints\flywheel.py': [(37, 'fstring')],
        r'd:\Python Workshop\K-Mastery\backend\app\api\v1\endpoints\hangul.py': [(23, 'trailing_space')],
        r'd:\Python Workshop\K-Mastery\backend\app\api\v1\endpoints\progress.py': [(20, 'l_var')],
        r'd:\Python Workshop\K-Mastery\backend\app\api\v1\endpoints\realtime.py': [(92, 'bare_except'), (219, 'bare_except')],
        r'd:\Python Workshop\K-Mastery\backend\app\core\redis_client.py': [(8, 'blank_lines')],
        r'd:\Python Workshop\K-Mastery\backend\app\db\session.py': [(44, 'blank_lines')],
        r'd:\Python Workshop\K-Mastery\backend\app\main.py': [(19, 'redef')],
        r'd:\Python Workshop\K-Mastery\backend\app\scripts\seed_official_vocab.py': [(120, 'fstring')],
        r'd:\Python Workshop\K-Mastery\backend\app\services\email.py': [(36, 'trailing_space'), (42, 'trailing_space'), (49, 'unused_var')],
        r'd:\Python Workshop\K-Mastery\backend\app\services\production_model.py': [(31, 'fstring'), (42, 'blank_lines')],
        r'd:\Python Workshop\K-Mastery\backend\rewrite_vocab.py': [
            (28, 'trailing_space'), (38, 'trailing_space'), (45, 'trailing_space'),
            (65, 'trailing_space'), (72, 'trailing_space'), (75, 'trailing_space'),
            (79, 'trailing_space'), (88, 'trailing_space'), (121, 'trailing_space')
        ],
        r'd:\Python Workshop\K-Mastery\backend\scripts\generate_banks.py': [(163, 'fstring')],
        r'd:\Python Workshop\K-Mastery\backend\smoke_test.py': [(4, 'l_var')]
    }
    
    for path, file_fixes in fixes.items():
        try:
            fix_file(path, file_fixes)
        except Exception as e:
            print(f"Error fixing {path}: {e}")

if __name__ == '__main__':
    main()
