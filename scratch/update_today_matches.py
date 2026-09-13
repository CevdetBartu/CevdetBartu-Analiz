import os
fpath = "artifacts/football-app/src/pages/TodayMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Remove KG Var / KG Yok headers
code = code.replace("<th style={{ padding: '8px 12px', width: 60, textAlign: 'center' }}>KG Var</th>\n                                <th style={{ padding: '8px 12px', width: 60, textAlign: 'center' }}>KG Yok</th>", "")

# Remove KG Var / KG Yok data cells
code = code.replace("<td style={{ padding: '8px 12px', textAlign: 'center' }}><OddsCell value={m.kg_var} /></td>\n                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{m.kg_yok != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.kg_yok.toFixed(2)}</span> : <span style={{ color: '#334' }}>—</span>}</td>", "")

# Change hasOdds logic so it doesn't require ms1, msx, ms2. Let's just require ANY odd or no odd at all (allow all).
# The user wants "tablosu yine olmalı", so just make hasOdds = true or at least check if there is ANY odd.
# Actually, the user says "ms1 oranı yoksa veya ms2 ... iddaa oranı vermemiş olabilir ama tablosu çıkmıyor bizde. tablosu yine olmalı"
# Let's make hasOdds = true always, or `m.oran_1 != null || m.oran_x != null || m.oran_2 != null || m.alt_orani != null`
code = code.replace("const hasOdds = m.oran_1 != null && m.oran_x != null && m.oran_2 != null;", "const hasOdds = true; // Always allow analysis")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

