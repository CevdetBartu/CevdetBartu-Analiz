import os, glob, re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        # Base names
        new_content = re.sub(r'CevdetBartu', 'KargaTahmin', new_content)
        new_content = re.sub(r'CRS Analytics', 'KargaTahmin', new_content)
        new_content = re.sub(r'CRS Analiz', 'KargaTahmin Analiz', new_content)
        new_content = re.sub(r'crsanalytics\.com', 'kargatahmin.com', new_content)
        new_content = re.sub(r'\bCRS\b', 'KargaTahmin', new_content)
        
        # Fixing my previous mistake where I used Karga Kâhin
        new_content = re.sub(r'Karga Kâhin Analiz', 'KargaTahmin', new_content)
        new_content = re.sub(r'Karga Kâhin Analytics', 'KargaTahmin', new_content)
        new_content = re.sub(r'Karga Kâhin', 'KargaTahmin', new_content)
        new_content = re.sub(r'Karga Khin', 'KargaTahmin', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")

for root, dirs, files in os.walk('artifacts/football-app/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.html') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))

replace_in_file('artifacts/football-app/index.html')
