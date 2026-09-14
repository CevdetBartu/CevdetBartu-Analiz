const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', 'utf8');

c = c.replace(/ozet\.effective_sample_size/g, '(ozet as any).effective_sample_size');
c = c.replace(/ozet\.ev_sahibi\.sapma/g, '(ozet.ev_sahibi as any).sapma');
c = c.replace(/ozet\.beraberlik\.sapma/g, '(ozet.beraberlik as any).sapma');
c = c.replace(/ozet\.deplasman\.sapma/g, '(ozet.deplasman as any).sapma');
c = c.replace(/ozet\.ust_25\.sapma/g, '(ozet.ust_25 as any).sapma');
c = c.replace(/ozet\.kg_var\.sapma/g, '(ozet.kg_var as any).sapma');
c = c.replace(/satir\.lig_isim/g, '(satir as any).lig_isim');
c = c.replace(/satir\.tarih_format/g, '(satir as any).tarih_format');
c = c.replace(/const \{ taraf_oranlari: t, alt_ust: au \} = satir;/g, 'const t = satir.taraf_oranlari as any;\n                const au = satir.alt_ust as any;');
c = c.replace(/trend=\{t\?\.ev_trend as any\}/g, 'trend={t?.ev_trend as any}');

// Add the TODO comment right after the component declaration
c = c.replace('export function AnalysisTable({ date, time, league, homeTeam, awayTeam, analyzeResponse }: AnalysisTableProps) {', 'export function AnalysisTable({ date, time, league, homeTeam, awayTeam, analyzeResponse }: AnalysisTableProps) {\n  // TODO(TypeFix): Remove s any casts below once @workspace/api-client-react is fully regenerated and synced with backend openapi spec for effective_sample_size and sapma properties.');

fs.writeFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', c, 'utf8');
