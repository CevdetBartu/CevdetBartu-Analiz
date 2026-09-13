import os, glob, re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    new_content = re.sub(r'Karga Kâhin Analiz', 'KargaTahmin', new_content)
    new_content = re.sub(r'Karga Kâhin Analytics', 'KargaTahmin', new_content)
    new_content = re.sub(r'Karga Kâhin', 'KargaTahmin', new_content)
    new_content = re.sub(r'Karga Khin', 'KargaTahmin', new_content) # encoding fallback
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('artifacts/football-app/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.html'):
            replace_in_file(os.path.join(root, file))

replace_in_file('artifacts/football-app/index.html')
