import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { queryScraperMatches } from "../lib/scraperDb";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

// Skorları parse edip resolve etme yardımcı fonksiyonu (resolvePredictions ile aynı mantık)
function parseScore(scoreStr: string) {
  if (!scoreStr) return null;
  const match = scoreStr.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  return { h: parseInt(match[1]), a: parseInt(match[2]) };
}

function evaluatePred(predType: string, predValue: string, ftScore: string) {
  if (/[a-zA-Z]/.test(ftScore)) return 'void';
  const ft = parseScore(ftScore);
  if (!ft) return 'pending';
  const {h, a} = ft;
  const total = h + a;
  const kg = h > 0 && a > 0;
  
  if (predType === 'MS') {
    if (predValue === '1' && h > a) return 'correct';
    if (predValue === 'X' && h === a) return 'correct';
    if (predValue === '2' && h < a) return 'correct';
    return 'incorrect';
  }
  if (predType === 'OU') {
    if (predValue === 'UST' && total >= 3) return 'correct';
    if (predValue === 'ALT' && total <= 2) return 'correct';
    return 'incorrect';
  }
  if (predType === 'BTTS') {
    if (predValue === 'VAR' && kg) return 'correct';
    if (predValue === 'YOK' && !kg) return 'correct';
    return 'incorrect';
  }
  return 'pending';
}

export async function runBackfill() {
  const db = new Database(DB_PATH);
  
  // Son 30 güne ait oynanmış maçları çek (mac_skoru dolu ve harf içermiyor)
  const query = `
    SELECT * FROM gecmis_maclar 
    WHERE 1=1
      AND mac_skoru IS NOT NULL 
      AND mac_skoru != ''
      AND mac_skoru NOT LIKE '%a%' 
      AND mac_skoru NOT LIKE '%P%'
    ORDER BY id DESC LIMIT 300
  `;
  
  const recentMatches = db.prepare(query).all() as any[];
  console.log(`Bulunan son 30 gün maçı: ${recentMatches.length}`);
  
  const insertStmt = db.prepare(`
    INSERT INTO system_predictions (
      match_id, date, league, 
      ms_prediction, ms_prob, ms_status,
      ou_prediction, ou_prob, ou_status,
      btts_prediction, btts_prob, btts_status,
      resolved_at
    ) VALUES (
      ?, ?, ?, 
      ?, ?, ?, 
      ?, ?, ?, 
      ?, ?, ?, 
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(match_id) DO NOTHING
  `);

  let count = 0;
  for (const m of recentMatches) {
    if (!m.oran_1 || !m.oran_x || !m.oran_2) continue; // Oranı olmayanları geç
    
    // Referans maçları çek
    const refsRaw = queryScraperMatches(m.oran_1, m.oran_x, m.oran_2, "CLOSING", m.lig, 15000);
    const similar = findSimilarMatches({
      oddsHome: m.oran_1,
      oddsDraw: m.oran_x,
      oddsAway: m.oran_2,
      altOdds: m.alt_orani,
      ustOdds: m.ust_orani,
      varOdds: m.kg_var,
      yokOdds: m.kg_yok,
      league: m.lig,
      ligSirasiDiff: (m.lig_sira_ev && m.lig_sira_dep) ? Math.abs(m.lig_sira_ev - m.lig_sira_dep) : null,
      maxResults: 25
    }, refsRaw);

    // Kendi maçımızı referanslardan çıkaralım (gerçekçi olması için)
    const validRefs = similar.filter(s => s.match.id !== String(m.id)).map(s => s.match);
    
    // Analize sok
    const analysis = analyze({
      date: m.tarih,
      time: m.saat,
      league: m.lig,
      homeTeam: m.ev_sahibi,
      awayTeam: m.deplasman,
      ligSirasiHome: m.lig_sira_ev,
      ligSirasiAway: m.lig_sira_dep,
      ligSirasiTotal: m.toplam_takim,
      oddsHome: m.oran_1,
      oddsDraw: m.oran_x,
      oddsAway: m.oran_2,
      altOdds: m.alt_orani,
      ustOdds: m.ust_orani,
      varOdds: m.kg_var,
      yokOdds: m.kg_yok
    }, validRefs);
    
    if (!analysis) continue;

    // Tahminleri belirle (en yüksek olanı)
    const msProb = Math.max(analysis.analiz_ozet.ev_sahibi.yuzde, analysis.analiz_ozet.beraberlik.yuzde, analysis.analiz_ozet.deplasman.yuzde);
    const msPred = msProb === analysis.analiz_ozet.ev_sahibi.yuzde ? '1' : msProb === analysis.analiz_ozet.beraberlik.yuzde ? 'X' : '2';
    
    const ouProb = Math.max(analysis.analiz_ozet.ust_25.yuzde, 100 - analysis.analiz_ozet.ust_25.yuzde);
    const ouPred = ouProb === analysis.analiz_ozet.ust_25.yuzde ? 'UST' : 'ALT';
    
    const bttsProb = Math.max(analysis.analiz_ozet.kg_var.yuzde, 100 - analysis.analiz_ozet.kg_var.yuzde);
    const bttsPred = bttsProb === analysis.analiz_ozet.kg_var.yuzde ? 'VAR' : 'YOK';
    
    // Durumları değerlendir
    const msStat = evaluatePred('MS', msPred, m.mac_skoru);
    const ouStat = evaluatePred('OU', ouPred, m.mac_skoru);
    const bttsStat = evaluatePred('BTTS', bttsPred, m.mac_skoru);
    
    try {
      insertStmt.run(
        m.id, m.tarih, m.lig,
        msPred, msProb, msStat,
        ouPred, ouProb, ouStat,
        bttsPred, bttsProb, bttsStat
      );
      count++;
    } catch(e) {}
  }
  
  console.log(`Backfill tamamlandı: ${count} maç eklendi.`);
}

// Komut satırından çalıştırılırsa
if (require.main === module) {
  runBackfill().then(() => process.exit(0));
}
