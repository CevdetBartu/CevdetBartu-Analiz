import Database from 'better-sqlite3';
import path from 'node:path';
import { toHistoricalMatch } from '../src/lib/scraperDb';
import { scoreMatch, type SimilarityQuery } from '../src/lib/similarity';
import { analyze, type AnalyzeTargetMatch, type AnalyzeRefMatch } from '../src/lib/analyzeEngine';
import type { HistoricalMatch } from '@workspace/db';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../../scripts/scraper/gecmis_maclar.db');

const MIN_HISTORY = 500;
const MAX_REF_MATCHES = 150;
const ODDS_TYPE: 'OPENING' | 'CLOSING' = 'OPENING';

interface BacktestRow {
  id: number; tarih: string; mac_skoru: string;
  oran_1: number | null; oran_x: number | null; oran_2: number | null;
  alt_orani: number | null; ust_orani: number | null;
  kg_var: number | null; kg_yok: number | null;
  oran_1_acilis: number | null; oran_x_acilis: number | null; oran_2_acilis: number | null;
  alt_orani_acilis: number | null; ust_orani_acilis: number | null;
  kg_var_acilis: number | null; kg_yok_acilis: number | null;
  lig: string | null; ev_sahibi: string; deplasman: string;
  lig_sira_ev: number | null; lig_sira_dep: number | null; toplam_takim: number | null;
  kart_ev: number | null; kart_dep: number | null; kirmizi_kart: number | null;
}

function parseFt(s: string | null): { h: number; a: number } | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d+)[:\-](\d+)$/);
  if (!m) return null;
  return { h: parseInt(m[1], 10), a: parseInt(m[2], 10) };
}

function parseDateStr(s: string): Date | null {
  const clean = (s || '').trim();
  let m = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = clean.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

const disagreements: Record<string, { n: number, modelErr: number, marketErr: number }> = {
  home: { n: 0, modelErr: 0, marketErr: 0 },
  draw: { n: 0, modelErr: 0, marketErr: 0 },
  away: { n: 0, modelErr: 0, marketErr: 0 },
  over25: { n: 0, modelErr: 0, marketErr: 0 },
  btts: { n: 0, modelErr: 0, marketErr: 0 }
};

function trackDisagreement(key: string, modelP: number, marketP: number, actual: 0|1) {
  if (Math.abs(modelP - marketP) >= 0.10) {
    disagreements[key].n++;
    disagreements[key].modelErr += (modelP - actual)**2;
    disagreements[key].marketErr += (marketP - actual)**2;
  }
}

class MarketTracker {
  name: string;
  sqErrSum = 0;
  n = 0;
  buckets = Array.from({ length: 10 }, () => ({ predSum: 0, actualSum: 0, count: 0 }));

  constructor(name: string) { this.name = name; }

  add(predictedProb: number, actualOutcome: 0 | 1) {
    const p = Math.min(1, Math.max(0, predictedProb));
    this.sqErrSum += (p - actualOutcome) ** 2;
    this.n++;
    const bucketIdx = Math.min(9, Math.floor(p * 10));
    const b = this.buckets[bucketIdx];
    b.predSum += p;
    b.actualSum += actualOutcome;
    b.count++;
  }

  brierScore(): number { return this.n > 0 ? this.sqErrSum / this.n : NaN; }

  print() {
    if (this.n === 0) return;
    console.log('\n=== ' + this.name + ' ===');
    console.log('N = ' + this.n + ', Brier Score = ' + this.brierScore().toFixed(4));
    console.log('Kalibrasyon:');
    for (let i = 0; i < 10; i++) {
      const b = this.buckets[i];
      if (b.count === 0) continue;
      const avgPred = (b.predSum / b.count) * 100;
      const avgActual = (b.actualSum / b.count) * 100;
      const diff = avgActual - avgPred;
      console.log('  [' + (i*10) + '-' + ((i+1)*10) + '%] n=' + b.count + ' tah=%' + avgPred.toFixed(1) + ' ger=%' + avgActual.toFixed(1) + ' fark=' + diff.toFixed(1));
    }
  }
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

  const rows = db.prepare(`
    SELECT *
    FROM gecmis_maclar
    WHERE tarih IS NOT NULL
      AND mac_skoru IS NOT NULL AND mac_skoru != '' AND mac_skoru NOT LIKE '%?%'
  `).all() as BacktestRow[];

  const withDates = rows
    .map(r => ({ row: r, date: parseDateStr(r.tarih) }))
    .filter((x): x is { row: BacktestRow; date: Date } => x.date != null);
  withDates.sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log('Toplam ' + withDates.length + ' maç bulundu.');

  const trackers = {
    home: new MarketTracker('Ev Sahibi (MS1) - MODEL'),
    home_market: new MarketTracker('Ev Sahibi (MS1) - PIYASA'),
    draw: new MarketTracker('Beraberlik (MS0) - MODEL'),
    draw_market: new MarketTracker('Beraberlik (MS0) - PIYASA'),
    away: new MarketTracker('Deplasman (MS2) - MODEL'),
    away_market: new MarketTracker('Deplasman (MS2) - PIYASA'),
    over25: new MarketTracker('2.5 Ust - MODEL'),
    over25_market: new MarketTracker('2.5 Ust - PIYASA'),
    btts: new MarketTracker('KG Var - MODEL'),
    btts_market: new MarketTracker('KG Var - PIYASA'),
  };

  const allHistorical = withDates.map(x => toHistoricalMatch(x.row as any, ODDS_TYPE));

  let evaluated = 0;
  const maxTest = Math.min(withDates.length, MIN_HISTORY + 2000);
  
  for (let i = MIN_HISTORY; i < maxTest; i++) {
    const targetRow = withDates[i].row;
    const actualFt = parseFt(targetRow.mac_skoru);
    if (!actualFt) continue;

    const oH = ODDS_TYPE === 'OPENING' ? targetRow.oran_1_acilis : targetRow.oran_1;
    const oD = ODDS_TYPE === 'OPENING' ? targetRow.oran_x_acilis : targetRow.oran_x;
    const oA = ODDS_TYPE === 'OPENING' ? targetRow.oran_2_acilis : targetRow.oran_2;
    if (!oH || !oD || !oA || oH <= 1.01 || oD <= 1.01 || oA <= 1.01) continue;

    const referencePool = allHistorical.slice(0, i);

    const alt = ODDS_TYPE === 'OPENING' ? targetRow.alt_orani_acilis : targetRow.alt_orani;
    const ust = ODDS_TYPE === 'OPENING' ? targetRow.ust_orani_acilis : targetRow.ust_orani;
    const varOran = ODDS_TYPE === 'OPENING' ? targetRow.kg_var_acilis : targetRow.kg_var;
    const yokOran = ODDS_TYPE === 'OPENING' ? targetRow.kg_yok_acilis : targetRow.kg_yok;

    const query: SimilarityQuery = {
      oddsHome: oH, oddsDraw: oD, oddsAway: oA,
      altOdds: alt ?? undefined, ustOdds: ust ?? undefined,
      varOdds: varOran ?? undefined, yokOdds: yokOran ?? undefined,
      league: targetRow.lig ?? undefined,
      maxResults: MAX_REF_MATCHES,
    };

    const scored = referencePool.map(m => scoreMatch(query, m)).filter(s => s.similarityScore >= 60).sort((a,b) => b.similarityScore - a.similarityScore).slice(0, MAX_REF_MATCHES);
    
    if (scored.length < 5) continue;

    const refMatches: AnalyzeRefMatch[] = scored.map(s => ({
      ...(s.match as any),
      similarityScore: s.similarityScore,
    }));

    const targetMatch: AnalyzeTargetMatch = {
      date: targetRow.tarih,
      league: targetRow.lig,
      homeTeam: targetRow.ev_sahibi,
      awayTeam: targetRow.deplasman,
      oddsHome: oH, oddsDraw: oD, oddsAway: oA,
      altOdds: query.altOdds ?? null, ustOdds: query.ustOdds ?? null,
      varOdds: query.varOdds ?? null, yokOdds: query.yokOdds ?? null,
      ligSirasiHome: targetRow.lig_sira_ev, ligSirasiAway: targetRow.lig_sira_dep,
      ligSirasiTotal: targetRow.toplam_takim,
    };

    const result = analyze(targetMatch, refMatches);
    const ozet = result.analiz_ozet;

    const actualHome = actualFt.h > actualFt.a ? 1 : 0;
    const actualDraw = actualFt.h === actualFt.a ? 1 : 0;
    const actualAway = actualFt.h < actualFt.a ? 1 : 0;
    const actualOver25 = (actualFt.h + actualFt.a) > 2.5 ? 1 : 0;
    const actualBtts = (actualFt.h > 0 && actualFt.a > 0) ? 1 : 0;

    const pHomeM = ozet.ev_sahibi.yuzde / 100;
    const pDrawM = ozet.beraberlik.yuzde / 100;
    const pAwayM = ozet.deplasman.yuzde / 100;
    const pOver25M = ozet.ust_25.yuzde / 100;
    const pBttsM = ozet.kg_var.yuzde / 100;

    trackers.home.add(pHomeM, actualHome);
    trackers.draw.add(pDrawM, actualDraw);
    trackers.away.add(pAwayM, actualAway);
    trackers.over25.add(pOver25M, actualOver25);
    trackers.btts.add(pBttsM, actualBtts);

    const margin1x2 = (1/oH) + (1/oD) + (1/oA);
    const pH_book = (1/oH)/margin1x2;
    const pD_book = (1/oD)/margin1x2;
    const pA_book = (1/oA)/margin1x2;
    
    trackers.home_market.add(pH_book, actualHome);
    trackers.draw_market.add(pD_book, actualDraw);
    trackers.away_market.add(pA_book, actualAway);

    trackDisagreement('home', pHomeM, pH_book, actualHome);
    trackDisagreement('draw', pDrawM, pD_book, actualDraw);
    trackDisagreement('away', pAwayM, pA_book, actualAway);
    
    if (alt && ust) {
      const marginOU = (1/alt) + (1/ust);
      const pOver_book = (1/ust)/marginOU;
      trackers.over25_market.add(pOver_book, actualOver25);
      trackDisagreement('over25', pOver25M, pOver_book, actualOver25);
    }
    if (varOran && yokOran) {
      const marginBtts = (1/varOran) + (1/yokOran);
      const pBtts_book = (1/varOran)/marginBtts;
      trackers.btts_market.add(pBtts_book, actualBtts);
      trackDisagreement('btts', pBttsM, pBtts_book, actualBtts);
    }

    evaluated++;
    if (evaluated % 50 === 0) console.log('... ' + evaluated + ' mac degerlendirildi');
  }

  console.log('\n\n========== DISAGREEMENT ANALYSIS (|MODEL - MARKET| >= 10%) ==========');
  for (const [key, d] of Object.entries(disagreements)) {
    console.log(`\nMarket: ${key.toUpperCase()}`);
    console.log(`Matches w/ >10% Diff: ${d.n}`);
    if (d.n > 0) {
      console.log(`Model Brier Score:  ${(d.modelErr / d.n).toFixed(4)}`);
      console.log(`Market Brier Score: ${(d.marketErr / d.n).toFixed(4)}`);
      const diff = (d.modelErr / d.n) - (d.marketErr / d.n);
      console.log(`Difference: ${diff > 0 ? '+' : ''}${diff.toFixed(4)} (${diff < 0 ? 'MODEL WINS' : 'MARKET WINS'})`);
    }
  }

  console.log('\n\n========== FINAL BACKTEST SONUCLARI (' + evaluated + ' mac, out-of-sample) ==========');
  for (const t of Object.values(trackers)) t.print();
  db.close();
}

main().catch(err => console.error(err));


