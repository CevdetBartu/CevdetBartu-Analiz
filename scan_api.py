import os

for root, _, files in os.walk('artifacts/api-server'):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if 'crs' in line.lower() or 'cevdetbartu' in line.lower():
                            print(f"{path}:{i+1}: {line.strip()[:100]}")
            except Exception as e:
                pass
