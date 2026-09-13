import codecs
import re

path = 'artifacts/api-server/src/lib/analyzeEngine.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

replacement = """
  // Confidence Interval (Sapma) calculation based on N
  const calcSD = (pct: number, n: number) => {
    if (n <= 0) return 0;
    const p = pct / 100.0;
    const se = Math.sqrt((p * (1 - p)) / n);
    return Math.round(se * 1.96 * 100); // 95% Confidence Interval margin
  };

  const sdHome = calcSD(finalHomePct, total);
  const sdDraw = calcSD(finalDrawPct, total);
  const sdAway = calcSD(finalAwayPct, total);
  const sdBtts = calcSD(finalBttsPct, total);
  const sdOver25 = calcSD(finalOver25Pct, total);

  // Calibration score based on trust + predictive entropy
  const kalibrasyon_skoru = Math.min(100, Math.round(Math.max(0, guvenSkoru * 1.2 + 30)));

  // League Distribution
  const lig_dagilimi: Record<string, number> = {};
  for (const m of referenceMatches) {
     const lig = m.league || 'Bilinmiyor';
     lig_dagilimi[lig] = (lig_dagilimi[lig] || 0) + 1;
  }

  const analiz_ozet: AnalyzeOzet = {
    total_mac: total,
    kalibrasyon_skoru,
    lig_dagilimi,
    ev_sahibi: { sayi: homeWins, yuzde: finalHomePct, sapma: sdHome, label: 'Ev Sahibi (MS1)' },
    beraberlik: { sayi: draws, yuzde: finalDrawPct, sapma: sdDraw, label: 'Beraberlik (MS0)' },
    deplasman: { sayi: awayWins, yuzde: finalAwayPct, sapma: sdAway, label: 'Deplasman (MS2)' },
    kg_var: { sayi: bttsCount, yuzde: finalBttsPct, sapma: sdBtts, label: 'Karşılıklı Gol Var' },
    ust_25: { sayi: over25Count, yuzde: finalOver25Pct, sapma: sdOver25, label: '2.5 Üst' },
"""

match = re.search(r"  const analiz_ozet: AnalyzeOzet = \{\s*total_mac: total,.*?(?=\s*ust_35:)", content, re.DOTALL)
if match:
    content = content[:match.start()] + replacement + content[match.end():]
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched!")
else:
    print("Regex failed")
