import codecs
import re

path = 'artifacts/football-app/src/components/AnalysisTable.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update StatPill signature and return
old_stat_pill = """function StatPill({ label, color, sapma }: { label: string; color: string; sapma?: number }) {
  // Sapma 0 ise tam opak (1.0), Sapma 15 ise daha şeffaf (0.4)
  const opacity = sapma != null ? Math.max(0.3, 1.0 - (sapma / 20.0)) : 1.0;
  
  return (
    <span className="stat-pill" style={{ color, opacity }}>
      {label} {sapma != null && <span style={{ fontSize: '0.85em', opacity: 0.7, marginLeft: '2px' }}>±%{sapma}</span>}
    </span>
  );
}"""

new_stat_pill = """function StatPill({ label, color, sapma, isZeroMatches }: { label: string; color: string; sapma?: number, isZeroMatches?: boolean }) {
  // Sıfır maç durumunda veri yetersizliği belli olsun diye yarı şeffaf (0.5), aksi halde sapmaya göre şeffaflık
  const opacity = isZeroMatches ? 0.5 : (sapma != null ? Math.max(0.3, 1.0 - (sapma / 20.0)) : 1.0);
  
  return (
    <span className="stat-pill" style={{ color, opacity }}>
      {label} 
      {isZeroMatches ? (
        <span style={{ fontSize: '0.85em', opacity: 0.7, marginLeft: '2px' }}>±N/A</span>
      ) : (
        sapma != null && <span style={{ fontSize: '0.85em', opacity: 0.7, marginLeft: '2px' }}>±%{sapma}</span>
      )}
    </span>
  );
}"""

if "function StatPill({ label, color, sapma }: {" in content:
    content = content.replace(old_stat_pill, new_stat_pill)

# 2. Update all StatPill calls in the file to pass isZeroMatches
# Find: <StatPill label={ozet.ev_sahibi.label}  color={pctColor(ozet.ev_sahibi.yuzde)} sapma={ozet.ev_sahibi.sapma} />
# We can regex replace <StatPill .*? /> to inject isZeroMatches={ozet.total_mac === 0}

content = re.sub(r'(<StatPill[^>]*sapma=\{[^}]*\})([^>]*>)', r'\1 isZeroMatches={ozet.total_mac === 0}\2', content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Patched StatPill for N/A!")
