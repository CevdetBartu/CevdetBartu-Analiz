import os

for root, _, files in os.walk('artifacts'):
    if 'node_modules' in root or '.git' in root or 'brain' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.env', '.json')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'AIza' in content or 'gemini' in content.lower():
                        print(f"Found potential key or reference in {path}")
            except Exception as e:
                pass
