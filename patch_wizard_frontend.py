import sys

file_path = 'artifacts/football-app/src/components/CouponWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_types = '''const BET_TYPES = [
  { id: 'ms1', label: 'Maç Sonucu 1' },
  { id: 'ms2', label: 'Maç Sonucu 2' },
  { id: 'kg_var', label: 'KG Var' },
  { id: 'ust_25', label: '2.5 Gol Üstü' },
  { id: 'ust_35', label: '3.5 Gol Üstü' },
  { id: 'ust_45', label: '4.5 Gol Üstü' },
  { id: 'gol_6_plus', label: '6+ Gol' },
  { id: 'iy_ms_1_2', label: 'İlk Yarı 1 / Maç Sonucu 2 (1/2)' },
  { id: 'iy_ms_2_1', label: 'İlk Yarı 2 / Maç Sonucu 1 (2/1)' }
];'''

new_types = '''const BET_TYPES = [
  { id: 'taraf', label: 'Maç Sonucu (Taraf Bahsi)' },
  { id: 'kg_var', label: 'KG Var' },
  { id: 'ust_25', label: '2.5 Gol Üstü' },
  { id: 'ust_35', label: '3.5 Gol Üstü' },
  { id: 'ust_45', label: '4.5 Gol Üstü' },
  { id: 'gol_6_plus', label: '6+ Gol' },
  { id: 'iy_ms_surpriz', label: 'Sürpriz İY/MS (1/2 veya 2/1)' }
];'''

content = content.replace(old_types, new_types)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Frontend types patched successfully')
