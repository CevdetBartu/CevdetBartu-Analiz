import os

app_dir = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src"

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            fpath = os.path.join(root, file)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'htScore' in content or 'ftScore' in content or 'devre_skoru' in content or 'mac_skoru' in content or '?' in content:
                    lines = content.split('\n')
                    for i, line in enumerate(lines, 1):
                        if '?' in line or 'Score' in line or 'skor' in line:
                            if any(k in line for k in ['Score', 'skor', 'DEVRE', 'MSKOR', 'devre', 'mac']):
                                print(f"{file}:{i} -> {line.strip()[:140]}")
