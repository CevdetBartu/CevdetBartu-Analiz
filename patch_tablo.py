import re; f = open('artifacts/api-server/src/lib/analyzeEngine.ts', 'r', encoding='utf-8'); content = f.read(); f.close();
content = content.replace('export interface TabloSatiri {', 'export interface TabloSatiri {\\n  tarih_lig?: string;\\n  detay_yuzde?: string;')
content = content.replace('takimlar: -  -  -,', 'takimlar: -  -  -,\\n      tarih_lig: t.league ? ${t.league} -  : \\'\\',\\n      detay_yuzde: \\'\\',')

ref_match_str = '''takimlar: -  -  -,'''
new_ref_match_str = '''takimlar: -  -  -,
      tarih_lig: (m as any).league ? ${(m as any).league} -  : \\'\\','''
content = content.replace(ref_match_str, new_ref_match_str)

open('artifacts/api-server/src/lib/analyzeEngine.ts', 'w', encoding='utf-8').write(content)
print('Patched analyzeEngine.ts')

