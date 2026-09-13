import sys

file_path = 'artifacts/api-server/src/routes/couponWizard.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_switch = '''      switch (betType) {
        case "ms1":
          probability = stats.ev_sahibi.yuzde;
          selection = "Maç Sonucu 1";
          oran = targetMatch.oran_1;
          break;
        case "ms2":
          probability = stats.deplasman.yuzde;
          selection = "Maç Sonucu 2";
          oran = targetMatch.oran_2;
          break;'''

new_switch = '''      switch (betType) {
        case "taraf":
          if (stats.ev_sahibi.yuzde >= stats.deplasman.yuzde) {
            probability = stats.ev_sahibi.yuzde;
            selection = "Maç Sonucu 1";
            oran = targetMatch.oran_1;
          } else {
            probability = stats.deplasman.yuzde;
            selection = "Maç Sonucu 2";
            oran = targetMatch.oran_2;
          }
          break;'''

content = content.replace(old_switch, new_switch)

old_iyms = '''        case "iy_ms_1_2":
          probability = stats.iy_ms_1_2?.yuzde || 0;
          selection = "İlk Yarı 1 / Maç Sonucu 2 (1/2)";
          oran = "-";
          break;
        case "iy_ms_2_1":
          probability = stats.iy_ms_2_1?.yuzde || 0;
          selection = "İlk Yarı 2 / Maç Sonucu 1 (2/1)";
          oran = "-";
          break;'''

new_iyms = '''        case "iy_ms_surpriz":
          const p12 = stats.iy_ms_1_2?.yuzde || 0;
          const p21 = stats.iy_ms_2_1?.yuzde || 0;
          if (p12 >= p21) {
            probability = p12;
            selection = "İlk Yarı 1 / Maç Sonucu 2 (1/2)";
          } else {
            probability = p21;
            selection = "İlk Yarı 2 / Maç Sonucu 1 (2/1)";
          }
          oran = "-";
          break;'''

content = content.replace(old_iyms, new_iyms)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Backend switch patched successfully')
