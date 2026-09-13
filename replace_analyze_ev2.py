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
      const hasOdds1 = (targetMatch.oddsHome ?? 0) > 1.0;
      const hasOdds2 = (targetMatch.oddsAway ?? 0) > 1.0;

      let t1 = '';
      if (homePct >= 85 && isHighSim) t1 = 'DA | 1 (Yüksek Güven - %89)';
      else if (homePct >= 75) t1 = 'DA | 1';
      
      if (t1) {
          if (hasOdds1 && edgeHome > 0) t1 += ' (Değerli Oran)';
          else if (hasOdds1) t1 += ' (Değersiz Oran)';
          tahminler.push(t1);
      }

      let t2 = '';
      if (awayPct >= 85 && isHighSim) t2 = 'DA | 2 (Yüksek Güven - %89)';
      else if (awayPct >= 75) t2 = 'DA | 2';

      if (t2) {
          if (hasOdds2 && edgeAway > 0) t2 += ' (Değerli Oran)';
          else if (hasOdds2) t2 += ' (Değersiz Oran)';
          tahminler.push(t2);
      }

      if (drawPct >= 50 && isHighSim) tahminler.push('DA | X (Yüksek Güven)');
      else if (drawPct >= 40) tahminler.push('DA | X');

      // KG - 85% / 20% thresholds (Yüksek Güven)
      if (bttsPct >= 85 && isHighSim) tahminler.push('MS | KG VAR (Yüksek Güven - %89)');
      else if (bttsPct >= 75) tahminler.push('MS | KG VAR');
      else if (bttsPct <= 15 && isHighSim) tahminler.push('MS | KG YOK (Yüksek Güven - %89)');
      else if (bttsPct <= 25) tahminler.push('MS | KG YOK');

      // 2.5 - 85% / 20% thresholds
      if (over25Pct >= 85 && isHighSim) tahminler.push('MS | 2,5 ÜST (Yüksek Güven - %89)');
      else if (over25Pct >= 75) tahminler.push('MS | 2,5 ÜST');
      else if (over25Pct <= 15 && isHighSim) tahminler.push('MS | 2,5 ALT (Yüksek Güven - %89)');
      else if (over25Pct <= 25) tahminler.push('MS | 2,5 ALT');

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
print('Replaced predictions logic with formatted EV checks!')

