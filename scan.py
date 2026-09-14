import os

target_words = ['CevdetBartu', 'CRS', 'KargaTahmin']
directories = ['artifacts/football-app/src', 'artifacts/api-server/src']

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'brain' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.html', '.css', '.md')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for word in target_words:
                        if word.lower() in content.lower():
                            print(f"Found {word} in {path}")
            except:
                pass
