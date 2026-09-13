with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == 'print("\\n[TEMİZLİK] Sıfır Oranlı Lig Filtresi çalıştırılıyor...")':
        new_lines.insert(-1, "        time.sleep(random.uniform(2.5, 4.0)) # League transition delay\n")
    new_lines.append(line)

with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
