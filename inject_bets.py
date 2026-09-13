import sys
import re

file_path = 'artifacts/api-server/src/lib/analyzeEngine.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Interface
content = content.replace('ust_35: StatGroup;', 'ust_35: StatGroup;\n  ust_45?: StatGroup;\n  gol_6_plus?: StatGroup;\n  iy_ms_1_2?: StatGroup;\n  iy_ms_2_1?: StatGroup;')

# 2. Variables
content = content.replace('let bttsCount = 0, over25Count = 0;', 'let bttsCount = 0, over25Count = 0;\n  let over45Count = 0, gol6PlusCount = 0;\n  let iyMs1_2Count = 0, iyMs2_1Count = 0;')

# 3. Tally 4.5 and 6+
old_tally = 'if (ft.home + ft.away > 3.5) over35Count++;'
new_tally = '''if (ft.home + ft.away > 3.5) over35Count++;
    if (ft.home + ft.away > 4.5) over45Count += w;
    if (ft.home + ft.away >= 6) gol6PlusCount += w;'''
content = content.replace(old_tally, new_tally)

# 4. HT/FT
old_htft = '''    const ht = parseScore(m.htScore);
    if (ht) {
      htValidCount++;
      if (ht.home + ht.away > 1.5) iyOver15Count++;
      if (ht.home + ht.away > 0.5) iyOver05Count++;
      
      const hs = `${ht.home}-${ht.away}`;
      htFreq[hs] = (htFreq[hs] || 0) + 1;
    }'''
new_htft = '''    const ht = parseScore(m.htScore);
    if (ht) {
      htValidCount++;
      if (ht.home + ht.away > 1.5) iyOver15Count++;
      if (ht.home + ht.away > 0.5) iyOver05Count++;
      
      const hs = `${ht.home}-${ht.away}`;
      htFreq[hs] = (htFreq[hs] || 0) + 1;
      
      if (ht.home > ht.away && ft.home < ft.away) iyMs1_2Count += w;
      if (ht.home < ht.away && ft.home > ft.away) iyMs2_1Count += w;
    }'''
content = content.replace(old_htft, new_htft)

# 5. Output
old_ozet = "ust_35:     statGroupWeighted(over35Count, total, finalOver35Pct, '3.5 Üst'),"
new_ozet = """ust_35:     statGroupWeighted(over35Count, total, finalOver35Pct, '3.5 Üst'),
      ust_45:     statGroupWeighted(0, total, Math.round((over45Count / Math.max(simSum, 0.001)) * 100), '4.5 Üst'),
      gol_6_plus: statGroupWeighted(0, total, Math.round((gol6PlusCount / Math.max(simSum, 0.001)) * 100), '6+ Gol'),
      iy_ms_1_2:  statGroupWeighted(0, total, Math.round((iyMs1_2Count / Math.max(simSum, 0.001)) * 100), '1/2'),
      iy_ms_2_1:  statGroupWeighted(0, total, Math.round((iyMs2_1Count / Math.max(simSum, 0.001)) * 100), '2/1'),"""
# Handle possible encoding anomalies in '3.5 Üst' by using a regex replace that ignores the literal label part
content = re.sub(r"ust_35:\s*statGroupWeighted\(over35Count,\s*total,\s*finalOver35Pct,\s*'[^\']+'\),", new_ozet, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected successfully!")
