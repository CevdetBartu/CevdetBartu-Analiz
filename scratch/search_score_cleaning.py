import os
import re

search_dirs = [
    r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src",
    r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src",
    r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper"
]

for sdir in search_dirs:
    for root, dirs, files in os.walk(sdir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.py', '.json', '.js')):
                fpath = os.path.join(root, file)
                try:
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if 'ftScore' in content or 'mac_skoru' in content or 'devre_skoru' in content:
                            matches = [line.strip() for line in content.split('\lines') if '?' in line or 'mac_skoru' in line or 'ftScore' in line]
                            if matches:
                                print(f"File: {fpath}")
                                for m in matches[:3]:
                                    print(f"   {m[:120]}")
                except Exception:
                    pass
