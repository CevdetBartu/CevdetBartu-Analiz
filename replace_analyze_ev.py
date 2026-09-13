import re; f = open('artifacts/api-server/src/lib/analyzeEngine.ts', 'r', encoding='utf-8'); content = f.read(); f.close(); 
new_code = '''    const tahminler: string[] = [];

    if (total < 5) {
      tahminler.push('Zayıf Güven (Yetersiz Referans Maç)');
    } else {
      // YÜKSEK GÜVEN (HIGH CONFIDENCE) Filtreleri - %85+ Başarı Hedefi ve EV (Edge) Kontrolü
      const homePct  = analiz_ozet.ev_sahibi.yuzde;
      const drawPct  = analiz_ozet.beraberlik.yuzde;
      const awayPct  = analiz_ozet.deplasman.yuzde;
      const isHighSim = avgSim >= 85;

      const edgeHome = kellyHome.edge;
      const edgeAway = kellyAway.edge;
      // Edge is in percentage, so > 0 means positive EV.

      if      (homePct >= 85 && isHighSim && edgeHome > 0) tahminler.push('DA | 1 (Yüksek Güven - %89)');
      else if (homePct >= 75 && edgeHome > 0) tahminler.push('DA | 1 (Değerli)');
      else if (homePct >= 75) tahminler.push('DA | 1 (Risksiz/Değersiz Oran)');
      
      else if (awayPct >= 85 && isHighSim && edgeAway > 0) tahminler.push('DA | 2 (Yüksek Güven - %89)');
      else if (awayPct >= 75 && edgeAway > 0) tahminler.push('DA | 2 (Değerli)');
      else if (awayPct >= 75) tahminler.push('DA | 2 (Risksiz/Değersiz Oran)');
      
      else if (drawPct >= 60) tahminler.push('DA | X');

      // KG - 85% / 20% thresholds (Yüksek Güven)
      if (bttsPct >= 85 && isHighSim) tahminler.push('MS | KG VAR (Yüksek Güven)');
      else if (bttsPct >= 75) tahminler.push('MS | KG VAR');
      else if (bttsPct <= 20 && isHighSim) tahminler.push('MS | KG YOK (Yüksek Güven)');
      else if (bttsPct <= 30) tahminler.push('MS | KG YOK');

      // 2.5 - 85% / 20% thresholds
      if (over25Pct >= 85 && isHighSim) tahminler.push('MS | 2,5 ÜST (Yüksek Güven)');
      else if (over25Pct >= 75) tahminler.push('MS | 2,5 ÜST');
      else if (over25Pct <= 20 && isHighSim) tahminler.push('MS | 2,5 ALT (Yüksek Güven)');
      else if (over25Pct <= 30) tahminler.push('MS | 2,5 ALT');

      // Sık İY skoru (%60+)
      if (sikIy) {
        const freq = htFreq[sikIy] ?? 0;
        if ((freq / total) * 100 >= 60) {
          tahminler.push(İY |  Skor);
        }
      }

      // Korner ve Kart (Daha sıkı eşikler)
      if (avgCards >= 6.5) tahminler.push('MS | (kart) 5,5 ÜST');
      else if (avgCards <= 2.5) tahminler.push('MS | (kart) 3,5 ALT');

      if (ortKorner !== null && kornerCount >= 3) {
        if (ortKorner >= 11.5) tahminler.push('MS | (korner) 10.5 ÜST');
        else if (ortKorner <= 8.0) tahminler.push('MS | (korner) 9.5 ALT');
      }
    }'''

new_content = re.sub(r'const tahminler: string\[\] = \[\];.*?const tablo_satirlari: TabloSatiri\[\] = \[\];', new_code + '\n\n    // ⚽ 4. Tablo satırları \n    const tablo_satirlari: TabloSatiri[] = [];', content, flags=re.DOTALL)

open('artifacts/api-server/src/lib/analyzeEngine.ts', 'w', encoding='utf-8').write(new_content)
print('Replaced predictions logic with EV checks!')

