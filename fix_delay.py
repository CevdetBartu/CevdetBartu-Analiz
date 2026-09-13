import re

with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a delay at the end of the main loop
if 'time.sleep(random.uniform(2.5, 4.0)) # League transition delay' not in content:
    content = content.replace(
        'print("\\n[TEMİZLİK] Sıfır Oranlı Lig Filtresi çalıştırılıyor...")',
        'time.sleep(random.uniform(2.5, 4.0)) # League transition delay\n    print("\\n[TEMİZLİK] Sıfır Oranlı Lig Filtresi çalıştırılıyor...")'
    )
    with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added transition delay.")
else:
    print("Already added.")
