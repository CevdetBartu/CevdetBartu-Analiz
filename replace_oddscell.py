import re; f = open('artifacts/football-app/src/components/AnalysisTable.tsx', 'r', encoding='utf-8'); content = f.read(); f.close();

new_func = '''function OddsCell({ value, isWinner, isLoser, trend }: { value: string | null | undefined; isWinner: boolean; isLoser: boolean; trend?: \\'up\\' | \\'down\\' | \\'none\\' }) {
  if (!value) return null;
  const cls = isWinner ? \\'odds-win\\' : isLoser ? \\'odds-lose\\' : \\'\\';
  const arrow = trend === \\'up\\' ? <span style={{color:\\'#ef4444\\', fontSize:\\'0.75em\\', marginLeft:\\'2px\\'}}>↑</span> : trend === \\'down\\' ? <span style={{color:\\'#10b981\\', fontSize:\\'0.75em\\', marginLeft:\\'2px\\'}}>↓</span> : null;
  return <span className={cls}>{value}{arrow}</span>;
}'''
content = re.sub(r'function OddsCell.*?return <span className=\{cls\}>\{value\}</span>;\n\}', new_func, content, flags=re.DOTALL)

old_taraf = '''<OddsCell value={t.ev}  isWinner={t.kazanan === 'ev'}  isLoser={!!t.kazanan && t.kazanan !== 'ev'} />
                          {t.ev && '-'}
                          <OddsCell value={t.ber} isWinner={t.kazanan === 'ber'} isLoser={!!t.kazanan && t.kazanan !== 'ber'} />
                          {t.ber && '-'}
                          <OddsCell value={t.dep} isWinner={t.kazanan === 'dep'} isLoser={!!t.kazanan && t.kazanan !== 'dep'} />'''
new_taraf = '''<OddsCell value={t.ev}  isWinner={t.kazanan === 'ev'}  isLoser={!!t.kazanan && t.kazanan !== 'ev'} trend={(t as any).ev_trend} />
                          {t.ev && '-'}
                          <OddsCell value={t.ber} isWinner={t.kazanan === 'ber'} isLoser={!!t.kazanan && t.kazanan !== 'ber'} trend={(t as any).ber_trend} />
                          {t.ber && '-'}
                          <OddsCell value={t.dep} isWinner={t.kazanan === 'dep'} isLoser={!!t.kazanan && t.kazanan !== 'dep'} trend={(t as any).dep_trend} />'''
content = content.replace(old_taraf, new_taraf)

open('artifacts/football-app/src/components/AnalysisTable.tsx', 'w', encoding='utf-8').write(content)
print('Replaced OddsCell!')

