

def fix_file(path, fixes):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Strip trailing whitespace and blank line whitespace for all lines
    lines = [line.rstrip() + '\n' for line in lines]

    # Apply specific fixes
    for line_num, fix_type in fixes:
        idx = line_num - 1
        if idx >= len(lines):
            continue

        if fix_type == 'remove':
            # We can just make it empty so line numbers don't shift
            lines[idx] = ''
        elif fix_type == 'bare_except':
            lines[idx] = lines[idx].replace('except:', 'except Exception:')
        elif fix_type == 'unused_var':
            lines[idx] = lines[idx].replace('response_content = ', '_ = ')
        elif fix_type == 'whitespace_before_colon':
            lines[idx] = lines[idx].replace(' :', ':')

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)


def main():
    fixes = {
        r'd:\Python Workshop\K-Mastery\backend\app\services\sequence_model.py': [
            (16, 'remove'),
            (23, 'remove')
        ],
        r'd:\Python Workshop\K-Mastery\backend\app\services\tutor.py': [
            (175, 'unused_var'),
            (209, 'whitespace_before_colon'),
            (255, 'bare_except'),
            (258, 'remove'),
            (266, 'whitespace_before_colon'),
            (270, 'bare_except')
        ],
        r'd:\Python Workshop\K-Mastery\backend\app\training\colab_notebooks\generate_notebooks.py': []
    }

    for path, file_fixes in fixes.items():
        try:
            fix_file(path, file_fixes)
        except Exception as e:
            print(f"Error fixing {path}: {e}")


if __name__ == '__main__':
    main()
