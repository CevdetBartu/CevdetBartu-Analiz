import os
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith('.py') or file.endswith('.ts') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'telegram' in content.lower():
                        print(filepath)
            except:
                pass
