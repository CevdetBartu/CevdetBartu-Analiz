/**
 * Football Statistics Analysis Engine
 * Accepts a target match + reference matches, returns a render-ready JSON.
 */
import { getLeagueGoalAverages, getTeamStandingsFallback } from './scraperDb';

export interface AnalyzeRefMatch {
  similarityScore?: number;
  id?: string | null;
  homeTeam: string;
  awayTeam: string;
  htScore?: string | null;
  ftScore: string;
  previousScore?: string | null;
  yellowCardsHome?: number | null;
  yellowCardsAway?: number | null;
  redCards?: number | null;
  ligSirasiHome?: number | null;
  ligSirasiAway?: number | null;
  ligSirasiTotal?: number | null;
  oddsHome?: number | null;
  oddsDraw?: number | null;
  oddsAway?: number | null;
  altOdds?: number | null;
  ustOdds?: number | null;
  varOdds?: number | null;
  yokOdds?: number | null;
  altOdds35?: number | null;
  ustOdds35?: number | null;
  iyAltOdds15?: number | null;
  iyUstOdds15?: number | null;
  iyAltOdds05?: number | null;
  iyUstOdds05?: number | null;
  avgOddsMin?: number | null;
  avgOddsMax?: number | null;
  imResult?: string | null;
  kornerHome?: number | null;
  kornerAway?: number | null;
  similarityScore?: number | null;
  matchDate?: string | null;
}

export interface AnalyzeTargetMatch {
  date?: string | null;
  time?: string | null;
  league?: string | null;
  homeTeam: string;
  awayTeam: string;
  ligSirasiHome?: number | null;
  ligSirasiAway?: number | null;
  ligSirasiTotal?: number | null;
  oddsHome?: number | null;
  oddsDraw?: number | null;
  oddsAway?: number | null;
  altOdds?: number | null;
  ustOdds?: number | null;
  varOdds?: number | null;
  yokOdds?: number | null;
  altOdds35?: number | null;
  ustOdds35?: number | null;
  iyAltOdds15?: number | null;
  iyUstOdds15?: number | null;
  iyAltOdds05?: number | null;
  iyUstOdds05?: number | null;
  avgOddsMin?: number | null;
  avgOddsMax?: number | null;
  oran_1_acilis?: number | null;
  oran_x_acilis?: number | null;
  oran_2_acilis?: number | null;
  alt_orani_acilis?: number | null;
  ust_orani_acilis?: number | null;
  kg_var_acilis?: number | null;
  kg_yok_acilis?: number | null;
  alt_orani_35_acilis?: number | null;
  ust_orani_35_acilis?: number | null;
  iy_alt_orani_15_acilis?: number | null;
  iy_ust_orani_15_acilis?: number | null;
  iy_alt_orani_05_acilis?: number | null;
  iy_ust_orani_05_acilis?: number | null;
  oran_1_kapanis?: number | null;
  oran_x_kapanis?: number | null;
  oran_2_kapanis?: number | null;
  alt_orani_kapanis?: number | null;
  ust_orani_kapanis?: number | null;
  kg_var_kapanis?: number | null;
  kg_yok_kapanis?: number | null;
  alt_orani_35_kapanis?: number | null;
  ust_orani_35_kapanis?: number | null;
  iy_alt_orani_15_kapanis?: number | null;
  iy_ust_orani_15_kapanis?: number | null;
  iy_alt_orani_05_kapanis?: number | null;
  iy_ust_orani_05_kapanis?: number | null;
}

// ─── Output types ────────────────────────────────────────────────────────────

export interface StatGroup {
  sayi: number;
  yuzde: number;
  sapma?: number; // Standard deviation / margin of error
  label: string;
}

export interface KellyOnerisi {
  oran: number;
  kasa_yuzdesi: number;
  edge: number;
  tavsiye: string;
}

export interface AnalyzeOzet {
  total_mac: number;
  effective_sample_size?: number;
  kalibrasyon_skoru?: number;
  lig_dagilimi?: Record<string, number>;
  ev_sahibi: StatGroup;
  beraberlik: StatGroup;
  deplasman: StatGroup;
  kg_var: StatGroup;
  ust_25: StatGroup;
  ust_35: StatGroup;
  ust_45?: StatGroup;
  gol_6_plus?: StatGroup;
  iy_ms_1_2?: StatGroup;
  iy_ms_2_1?: StatGroup;
  iy_ust_15: StatGroup;
  iy_ust_05: StatGroup;
  ort_kart: number;
  ort_korner: number | null;
  ust_10_korner: StatGroup;
  sik_ms: string | null;
  sik_iy: string | null;
  guvenlik_skoru?: number | null;
  guven_seviyesi?: string | null;
  guven_skoru?: number | null;
  kelly_onerileri?: {
    ev_sahibi: KellyOnerisi;
    beraberlik: KellyOnerisi;
    deplasman: KellyOnerisi;
  } | null;
  model_roi?: number | null;
  predictability?: string | null;
}

export type OddsWinner = 'ev' | 'ber' | 'dep' | null;
export type AltUstWinner = 'alt' | 'ust' | null;
export type VarYokWinner = 'var' | 'yok' | null;

export interface TarafOranlari {
  ev: string | null;
  ber: string | null;
  dep: string | null;
  kazanan: OddsWinner;
  ev_trend?: 'up' | 'down' | 'flat' | null;
  ber_trend?: 'up' | 'down' | 'flat' | null;
  dep_trend?: 'up' | 'down' | 'flat' | null;
}

export interface AltUst {
  alt: string | null;
  ust: string | null;
  kazanan: AltUstWinner;
  alt_trend?: 'up' | 'down' | 'flat' | null;
  ust_trend?: 'up' | 'down' | 'flat' | null;
}

export interface VarYok {
  var: string | null;
  yok: string | null;
  kazanan: VarYokWinner;
  var_trend?: 'up' | 'down' | 'flat' | null;
  yok_trend?: 'up' | 'down' | 'flat' | null;
}

export interface TabloSatiri {
  tarih_lig?: string;
  detay_yuzde?: string;
  id: string;
  is_target: boolean;
  analiz_yuzde: string;
  iy_skor: string | null;
  iy_skor_renk: string | null;
  iy_skor_sik_mi: boolean;
  ms_skor: string | null;
  ms_skor_renk: string | null;
  ms_skor_sik_mi: boolean;
  iy_tahmini: string | null;
  ms_tahmini: string | null;
  row_renk: string;
  takimlar: string;
  is_highlight: boolean;
  onceki_skor: string;
  kirmizi_kart_var_mi: boolean;
  kart_display: string;
  kart_yuksek_mi: boolean;
  lig_sirasi: string;
  taraf_oranlari: TarafOranlari;
  alt_ust: AltUst;
  alt_ust_35: AltUst;
  iy_alt_ust_15: AltUst;
  iy_alt_ust_05: AltUst;
  var_yok: VarYok;
  ortalama: string;
  korner_display: string;
  im_sonuc: string;
  im_renk: string;
}

export interface AnalyzeResponse {
  analiz_ozet: AnalyzeOzet;
  tahminler: string[];
  tablo_satirlari: TabloSatiri[];
  poisson_probs?: {
    pHome: number;
    pDraw: number;
    pAway: number;
    pOver25: number;
    pBtts: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseScore(s: string | null | undefined): { home: number; away: number } | null {
  if (!s) return null;
  const clean = s.trim().replace(/\?/g, '').replace(/\s/g, '');
  const m = clean.match(/^(\d+)[:\-](\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1], 10), away: parseInt(m[2], 10) };
}

function resultType(s: string | null | undefined): 'ev' | 'ber' | 'dep' | null {
  const p = parseScore(s);
  if (!p) return null;
  if (p.home > p.away) return 'ev';
  if (p.home < p.away) return 'dep';
  return 'ber';
}

function scoreClass(s: string | null | undefined): string | null {
  const r = resultType(s);
  if (r === 'ev') return 'score-home';
  if (r === 'dep') return 'score-away';
  if (r === 'ber') return 'score-draw';
  return null;
}

function rowClass(s: string | null | undefined): string {
  const r = resultType(s);
  if (r === 'ev') return 'row-home';
  if (r === 'dep') return 'row-away';
  if (r === 'ber') return 'row-draw';
  return '';
}

function fmtOdds(v: number | string | null | undefined): string | null {
  if (v == null) return null;
  const num = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(num) || num <= 1.0) return null;
  return num.toFixed(2).replace('.', ',');
}

function fmtCard(v: number | null | undefined, pad = true): string {
  if (v == null) return '00';
  return pad ? String(v).padStart(2, '0') : String(v);
}

function mostCommon(freq: Record<string, number>): string | null {
  const entries = Object.entries(freq);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function statGroup(count: number, total: number, label: string): StatGroup {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return { sayi: count, yuzde: pct, label: `${label} ${count}/${total} (${pct}%)` };
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const clean = s.trim();
  // YYYY-MM-DD
  let m = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }
  // DD.MM.YYYY
  m = clean.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }
  return null;
}

function imRenk(im: string | null | undefined): string {
  if (!im) return '';
  if (im === '2/1') return 'im-special';
  if (im === '1/1') return 'im-good';
  return '';
}

function calcOrtalamaString(item: any): string {
  if (item.avgOddsMin != null && item.avgOddsMax != null) {
    return `${fmtOdds(item.avgOddsMin)}-${fmtOdds(item.avgOddsMax)}`;
  }
  const odds: number[] = [];
  const oH = item.oddsHome ?? item.oran_1;
  const oD = item.oddsDraw ?? item.oran_x;
  const oA = item.oddsAway ?? item.oran_2;
  const oAlt = item.altOdds ?? item.alt_orani;
  const oUst = item.ustOdds ?? item.ust_orani;

  if (oH != null && oH > 1.0) odds.push(oH);
  if (oD != null && oD > 1.0) odds.push(oD);
  if (oA != null && oA > 1.0) odds.push(oA);
  if (oAlt != null && oAlt > 1.0) odds.push(oAlt);
  if (oUst != null && oUst > 1.0) odds.push(oUst);

  if (odds.length >= 2) {
    const minO = Math.min(...odds);
    const maxO = Math.max(...odds);
    return `${fmtOdds(minO)}-${fmtOdds(maxO)}`;
  }
  return '';
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poissonProb(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export interface AnalyzeConfig {
  consensusWeightSimilarity?: number; // default 0.6
  betaBinomialM?: number;              // default 4.0
  timeDecayScale?: number;            // default 540.0
}

export function analyze(
  targetMatch: AnalyzeTargetMatch,
  referenceMatches: AnalyzeRefMatch[],
  config?: AnalyzeConfig
): AnalyzeResponse {
  const consensusWeightSim = config?.consensusWeightSimilarity ?? 0.6;
  const consensusWeightPoisson = 1.0 - consensusWeightSim;
  let M = config?.betaBinomialM ?? 4.0;
  const decayScale = config?.timeDecayScale ?? 540.0;

  const total = referenceMatches.length;

  // ── 1. Aggregate stats ────────────────────────────────────────────────────
  let homeWins = 0, draws = 0, awayWins = 0;
  let bttsCount = 0, over25Count = 0;
  let over45Count = 0, gol6PlusCount = 0;
  let iyMs1_2Count = 0, iyMs2_1Count = 0;
  let over35Count = 0, iyOver15Count = 0, iyOver05Count = 0;
  let totalGoals = 0, totalCards = 0, cardCount = 0;
  let totalKorner = 0, kornerCount = 0, ust10CornerCount = 0;
  let totalHomeGoalsRef = 0;
  let totalAwayGoalsRef = 0;
  let validGoalsMatches = 0;
  let htValidCount = 0;
  const htFreq: Record<string, number> = {};
  const ftFreq: Record<string, number> = {};

  let simSum = 0;
  let homeWinsWeighted = 0;
  let drawsWeighted = 0;
  let awayWinsWeighted = 0;
  let bttsWeighted = 0;
  let over25Weighted = 0;
  let over35Weighted = 0;
  let iyOver15Weighted = 0;
  let iyOver05Weighted = 0;
  let htSimSum = 0;
  const simScores: number[] = [];

  let sumWSquared = 0;

  for (const m of referenceMatches) {
    const targetD = parseDate(targetMatch.date);
    const refD = parseDate(m.matchDate);
    let decay = 1.0;
    if (targetD && refD) {
      const daysDiff = Math.abs((targetD.getTime() - refD.getTime()) / (1000 * 60 * 60 * 24));
      decay = Math.exp(-daysDiff / decayScale);
    }

    const sim = m.similarityScore ?? 100;
    simScores.push(sim);
    
    // Kernel-weighted similarity using squared similarity score + Time Decay
    const w = Math.pow(sim, 2) * decay;
    simSum += w;
    sumWSquared += w * w;

    const ft = parseScore(m.ftScore);
    if (!ft) continue;

    totalHomeGoalsRef += ft.home;
    totalAwayGoalsRef += ft.away;
    validGoalsMatches++;

    if (ft.home > ft.away) {
      homeWins++;
      homeWinsWeighted += w;
    } else if (ft.home < ft.away) {
      awayWins++;
      awayWinsWeighted += w;
    } else {
      draws++;
      drawsWeighted += w;
    }

    const goals = ft.home + ft.away;
    totalGoals += goals;
    if (ft.home > 0 && ft.away > 0) {
      bttsCount++;
      bttsWeighted += w;
    }
    if (goals > 2.5) {
      over25Count++;
      over25Weighted += w;
    }
    if (goals > 3.5) {
      over35Count++;
      over35Weighted += w;
      }
      if (goals > 4.5) { over45Count++; }
      if (goals >= 6) { gol6PlusCount++; }
      
      const htxx = parseScore(m.htScore);
        
      if (htxx && ft) {
        if (htxx.home > htxx.away && ft.home < ft.away) iyMs1_2Count++;
        if (htxx.home < htxx.away && ft.home > ft.away) iyMs2_1Count++;
      }

    // FT score freq
    const ftKey = `${ft.home}:${ft.away}`;
    ftFreq[ftKey] = (ftFreq[ftKey] ?? 0) + 1;

    // HT score freq
    const ht = parseScore(m.htScore);
    if (ht) {
      htValidCount++;
      htSimSum += w;
      const htKey = `${ht.home}:${ht.away}`;
      htFreq[htKey] = (htFreq[htKey] ?? 0) + 1;

      const htGoals = ht.home + ht.away;
      if (htGoals > 1.5) {
        iyOver15Count++;
        iyOver15Weighted += w;
      }
      if (htGoals > 0.5) {
        iyOver05Count++;
        iyOver05Weighted += w;
      }
    }

    // Cards (only counted if data is present)
    if (m.yellowCardsHome != null || m.yellowCardsAway != null) {
      totalCards +=
        (m.yellowCardsHome ?? 0) +
        (m.yellowCardsAway ?? 0) +
        (m.redCards ?? 0);
      cardCount++;
    }

    // Korner istatistikleri
    if (m.kornerHome != null || m.kornerAway != null) {
      const mk = (m.kornerHome ?? 0) + (m.kornerAway ?? 0);
      totalKorner += mk;
      kornerCount++;
      if (mk >= 10) ust10CornerCount++;
    }
  }

  const effectiveSampleSize = sumWSquared > 0
    ? Math.round(((simSum * simSum) / sumWSquared) * 10) / 10
    : 0;

  // --- BAYESIAN SHRINKAGE OPTIMIZATION (Bayesyen Büzülme) ---
  // İstatistiki overfitting'i engellemek için küçük örneklem yüzdelerini market/global baz eğrisine çeker
  
  // Madde 2: Shin's Method (Insider Trading Model) Devigging
  let priorHome = 0.35;
  let priorDraw = 0.30;
  let priorAway = 0.35;

  if (targetMatch.oddsHome && targetMatch.oddsDraw && targetMatch.oddsAway) {
    const oH = targetMatch.oddsHome;
    const oD = targetMatch.oddsDraw;
    const oA = targetMatch.oddsAway;
    const piH = 1.0 / oH;
    const piD = 1.0 / oD;
    const piA = 1.0 / oA;
    const S = piH + piD + piA;
    
    // Shin's insider trading proportion parameter z
    const z = Math.max(0, (S - 1.0) / 2.0);
    
    // Shin's devigged true un-biased probabilities
    priorHome = (Math.sqrt(z * z + 4 * (1 - z) * (piH * piH / S)) - z) / (2 * (1 - z));
    priorDraw = (Math.sqrt(z * z + 4 * (1 - z) * (piD * piD / S)) - z) / (2 * (1 - z));
    priorAway = (Math.sqrt(z * z + 4 * (1 - z) * (piA * piA / S)) - z) / (2 * (1 - z));

    const sumShin = priorHome + priorDraw + priorAway;
    if (sumShin > 0) {
      priorHome /= sumShin;
      priorDraw /= sumShin;
      priorAway /= sumShin;
    }
  } else {
    if (targetMatch.oddsHome) priorHome = 1.0 / targetMatch.oddsHome;
    if (targetMatch.oddsDraw) priorDraw = 1.0 / targetMatch.oddsDraw;
    if (targetMatch.oddsAway) priorAway = 1.0 / targetMatch.oddsAway;
    const s = priorHome + priorDraw + priorAway;
    if (s > 0) {
      priorHome /= s;
      priorDraw /= s;
      priorAway /= s;
    }
  }

  // Alt/Üst 2.5 marj temizleme
  let priorOver = 0.48;
  if (targetMatch.ustOdds && targetMatch.altOdds) {
    const sumOU = (1.0 / targetMatch.ustOdds) + (1.0 / targetMatch.altOdds);
    priorOver = (1.0 / targetMatch.ustOdds) / sumOU;
  } else if (targetMatch.ustOdds) {
    // Tek oran varsa ortalama %6.5 pazar marjını düşerek düzelt
    priorOver = (1.0 / targetMatch.ustOdds) / 1.065;
  }

  // Diğer pazar prior olasılıkları (marj temizlenmiş yaklaşımlarla)
  const priorBtts = targetMatch.varOdds && targetMatch.yokOdds
    ? (1.0 / targetMatch.varOdds) / ((1.0 / targetMatch.varOdds) + (1.0 / targetMatch.yokOdds))
    : (targetMatch.varOdds ? (1.0 / targetMatch.varOdds) / 1.065 : 0.52);

  const priorOver35 = targetMatch.ustOdds35 && targetMatch.altOdds35
    ? (1.0 / targetMatch.ustOdds35) / ((1.0 / targetMatch.ustOdds35) + (1.0 / targetMatch.altOdds35))
    : (targetMatch.ustOdds35 ? (1.0 / targetMatch.ustOdds35) / 1.065 : 0.25);

  const priorIyOver15 = targetMatch.iyUstOdds15 && targetMatch.iyAltOdds15
    ? (1.0 / targetMatch.iyUstOdds15) / ((1.0 / targetMatch.iyUstOdds15) + (1.0 / targetMatch.iyAltOdds15))
    : (targetMatch.iyUstOdds15 ? (1.0 / targetMatch.iyUstOdds15) / 1.065 : 0.32);

  const priorIyOver05 = targetMatch.iyUstOdds05 && targetMatch.iyAltOdds05
    ? (1.0 / targetMatch.iyUstOdds05) / ((1.0 / targetMatch.iyUstOdds05) + (1.0 / targetMatch.iyAltOdds05))
    : (targetMatch.iyUstOdds05 ? (1.0 / targetMatch.iyUstOdds05) / 1.065 : 0.70);

  const priorCorner = 0.50;

  const avgSim = simScores.length > 0 ? (simScores.reduce((a, b) => a + b, 0) / simScores.length) : 0;

  // Adaptive M (Bayesyen büzülme gücü)
  M = config?.betaBinomialM ?? (effectiveSampleSize > 0 ? (8.0 / Math.sqrt(effectiveSampleSize)) : 4.0);
  const M_ht = htValidCount > 0 ? (8.0 / Math.sqrt(htValidCount)) : M;
  const M_corner = kornerCount > 0 ? (8.0 / Math.sqrt(kornerCount)) : M;

  // Kernel-weighted outcome probabilities (P_ham) and Shrinkage probabilities (P_final)
  // P_final = (N_benzer * P_ham + M * P_piyasa) / (N_benzer + M)
  const pHamHome = total > 0 && simSum > 0 ? (homeWinsWeighted / simSum) : priorHome;
  const pHamDraw = total > 0 && simSum > 0 ? (drawsWeighted / simSum) : priorDraw;
  const pHamAway = total > 0 && simSum > 0 ? (awayWinsWeighted / simSum) : priorAway;

  let pFinalHome = total > 0 ? ((total * pHamHome + M * priorHome) / (total + M)) : priorHome;
  let pFinalDraw = total > 0 ? ((total * pHamDraw + M * priorDraw) / (total + M)) : priorDraw;
  let pFinalAway = total > 0 ? ((total * pHamAway + M * priorAway) / (total + M)) : priorAway;

  // Normalize side probabilities to sum to exactly 1.0
  const sumFinalSides = pFinalHome + pFinalDraw + pFinalAway;
  if (sumFinalSides > 0) {
    pFinalHome /= sumFinalSides;
    pFinalDraw /= sumFinalSides;
    pFinalAway /= sumFinalSides;
  }

  const homePctWeighted = Math.round(pFinalHome * 100);
  const drawPctWeighted = Math.round(pFinalDraw * 100);
  const awayPctWeighted = 100 - homePctWeighted - drawPctWeighted;

  // Target League Goal Base-Rate Normalization Factor
  const leagueGoalAverages = getLeagueGoalAverages(targetMatch.league || "");
  const targetLeagueAvgGoals = (leagueGoalAverages.homePrior + leagueGoalAverages.awayPrior);
  const globalRefAvgGoals = 2.75;
  const leagueGoalFactor = Math.min(1.25, Math.max(0.75, targetLeagueAvgGoals / globalRefAvgGoals));

  const pHamBtts = total > 0 && simSum > 0 ? (bttsWeighted / simSum) : priorBtts;
  let pFinalBtts = total > 0 ? ((total * pHamBtts + M * priorBtts) / (total + M)) : priorBtts;
  pFinalBtts = Math.min(0.95, Math.max(0.05, pFinalBtts * leagueGoalFactor));
  const bttsPctWeighted = Math.round(pFinalBtts * 100);

  const pHamOver25 = total > 0 && simSum > 0 ? (over25Weighted / simSum) : priorOver;
  let pFinalOver25 = total > 0 ? ((total * pHamOver25 + M * priorOver) / (total + M)) : priorOver;
  pFinalOver25 = Math.min(0.95, Math.max(0.05, pFinalOver25 * leagueGoalFactor));
  const over25PctWeighted = Math.round(pFinalOver25 * 100);

  const pHamOver35 = total > 0 && simSum > 0 ? (over35Weighted / simSum) : priorOver35;
  const pFinalOver35 = total > 0 ? ((total * pHamOver35 + M * priorOver35) / (total + M)) : priorOver35;
  const over35PctWeighted = Math.round(pFinalOver35 * 100);

  const pHamIyOver15 = htValidCount > 0 && htSimSum > 0 ? (iyOver15Weighted / htSimSum) : priorIyOver15;
  const pFinalIyOver15 = htValidCount > 0 ? ((htValidCount * pHamIyOver15 + M_ht * priorIyOver15) / (htValidCount + M_ht)) : priorIyOver15;
  const iyOver15PctWeighted = Math.round(pFinalIyOver15 * 100);

  const pHamIyOver05 = htValidCount > 0 && htSimSum > 0 ? (iyOver05Weighted / htSimSum) : priorIyOver05;
  const pFinalIyOver05 = htValidCount > 0 ? ((htValidCount * pHamIyOver05 + M_ht * priorIyOver05) / (htValidCount + M_ht)) : priorIyOver05;
  const iyOver05PctWeighted = Math.round(pFinalIyOver05 * 100);

  // Corner weight count (w_i = sim_i^2 * decay)
  let cornerWeighted = 0;
  let cornerSimSum = 0;
  for (let i = 0; i < referenceMatches.length; i++) {
    const m = referenceMatches[i];
    if (m.kornerHome != null || m.kornerAway != null) {
      const targetD = parseDate(targetMatch.date);
      const refD = parseDate(m.matchDate);
      let decay = 1.0;
      if (targetD && refD) {
        const daysDiff = Math.abs((targetD.getTime() - refD.getTime()) / (1000 * 60 * 60 * 24));
        decay = Math.exp(-daysDiff / 540.0);
      }
      const sim = m.similarityScore ?? 100;
      const w = Math.pow(sim, 2) * decay;
      
      const mk = (m.kornerHome ?? 0) + (m.kornerAway ?? 0);
      if (mk >= 10) {
        cornerWeighted += w;
      }
      cornerSimSum += w;
    }
  }

  const pHamCorner = kornerCount > 0 && cornerSimSum > 0 ? (cornerWeighted / cornerSimSum) : priorCorner;
  const pFinalCorner = kornerCount > 0 ? ((kornerCount * pHamCorner + M_corner * priorCorner) / (kornerCount + M_corner)) : priorCorner;
  const cornerPctWeighted = Math.round(pFinalCorner * 100);

  // Güven Skoru = N_benzer * Ortalama_Benzerlik_Skoru / 100
  const guvenSkoru = Math.round((total * avgSim / 100) * 10) / 10;
  let guvenSeviyesi = "DUSUK";
  if (guvenSkoru >= 40) {
    guvenSeviyesi = "YUKSEK";
  } else if (guvenSkoru >= 15) {
    guvenSeviyesi = "ORTA";
  }

  // --- POISSON & CONSENSUS ENGINE (Model V3) ---
  // Get league-specific prior goal averages (defaults to 1.35 and 1.15 if not found)
  const leagueName = targetMatch.league || "";
  const { homePrior, awayPrior } = getLeagueGoalAverages(leagueName);

  let lambdaHome = homePrior;
  let lambdaAway = awayPrior;
  if (validGoalsMatches > 0) {
    const rawLambdaHome = totalHomeGoalsRef / validGoalsMatches;
    const rawLambdaAway = totalAwayGoalsRef / validGoalsMatches;
    
    // Bayesian Shrinkage for Poisson Lambdas (C = 4.0, baseline = league-specific priors)
    const C_GOALS = 4.0;
    const K_GOALS = validGoalsMatches / (validGoalsMatches + C_GOALS);
    lambdaHome = K_GOALS * rawLambdaHome + (1.0 - K_GOALS) * homePrior;
    lambdaAway = K_GOALS * rawLambdaAway + (1.0 - K_GOALS) * awayPrior;
  }

  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;
  let pOver25 = 0;
  let pOver35 = 0;
  let pBtts = 0;
  let sumP = 0;

  // Dixon-Coles low-score dependence adjustment (rho = -0.13)
  const rho = -0.13;
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      let pScore = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
      
      // Dixon-Coles Tau(h, a) factor
      let tau = 1.0;
      if (h === 0 && a === 0) tau = 1.0 - lambdaHome * lambdaAway * rho;
      else if (h === 1 && a === 0) tau = 1.0 + lambdaAway * rho;
      else if (h === 0 && a === 1) tau = 1.0 + lambdaHome * rho;
      else if (h === 1 && a === 1) tau = 1.0 - rho;

      pScore *= Math.max(0, tau);

      sumP += pScore;
      if (h > a) pHomeWin += pScore;
      else if (h < a) pAwayWin += pScore;
      else pDraw += pScore;

      if (h + a >= 3) pOver25 += pScore;
      if (h + a >= 4) pOver35 += pScore;
      if (h > 0 && a > 0) pBtts += pScore;
    }
  }

  let pIyOver15 = 0;
  let pIyOver05 = 0;
  let sumP_HT = 0;
  for (let h_ht = 0; h_ht <= 5; h_ht++) {
    for (let a_ht = 0; a_ht <= 5; a_ht++) {
      const pScore_HT = poissonProb(h_ht, lambdaHome / 2) * poissonProb(a_ht, lambdaAway / 2);
      sumP_HT += pScore_HT;
      if (h_ht + a_ht >= 2) pIyOver15 += pScore_HT;
      if (h_ht + a_ht >= 1) pIyOver05 += pScore_HT;
    }
  }

  if (sumP > 0) {
    pHomeWin /= sumP;
    pDraw /= sumP;
    pAwayWin /= sumP;
    pOver25 /= sumP;
    pOver35 /= sumP;
    pBtts /= sumP;
  }
  if (sumP_HT > 0) {
    pIyOver15 /= sumP_HT;
    pIyOver05 /= sumP_HT;
  }

  // Consensus Model: Similarity + Poisson (Weighted)
  let rawHomePct = total > 0 ? consensusWeightSim * homePctWeighted + consensusWeightPoisson * pHomeWin * 100 : priorHome * 100;
  let rawDrawPct = total > 0 ? consensusWeightSim * drawPctWeighted + consensusWeightPoisson * pDraw * 100 : priorDraw * 100;
  let rawAwayPct = total > 0 ? consensusWeightSim * awayPctWeighted + consensusWeightPoisson * pAwayWin * 100 : priorAway * 100;

  // Normalize side probabilities to sum to exactly 100%
  const sumSides = rawHomePct + rawDrawPct + rawAwayPct;
  const finalHomePct = sumSides > 0 ? Math.round((rawHomePct / sumSides) * 100) : Math.round(priorHome * 100);
  const finalDrawPct = sumSides > 0 ? Math.round((rawDrawPct / sumSides) * 100) : Math.round(priorDraw * 100);
  const finalAwayPct = 100 - finalHomePct - finalDrawPct;

  const finalBttsPct = total > 0 ? Math.round(consensusWeightSim * bttsPctWeighted + consensusWeightPoisson * pBtts * 100) : Math.round(priorBtts * 100);
  const finalOver25Pct = total > 0 ? Math.round(consensusWeightSim * over25PctWeighted + consensusWeightPoisson * pOver25 * 100) : Math.round(priorOver * 100);
  const finalOver35Pct = total > 0 ? Math.round(consensusWeightSim * over35PctWeighted + consensusWeightPoisson * pOver35 * 100) : Math.round(priorOver35 * 100);
  const finalIyOver15Pct = total > 0 ? Math.round(consensusWeightSim * iyOver15PctWeighted + consensusWeightPoisson * pIyOver15 * 100) : Math.round(priorIyOver15 * 100);
  const finalIyOver05Pct = total > 0 ? Math.round(consensusWeightSim * iyOver05PctWeighted + consensusWeightPoisson * pIyOver05 * 100) : Math.round(priorIyOver05 * 100);

  // Kelly Criterion Money Management Calculations (Quarter-Kelly, Max 10%)
  let kellyHome: KellyOnerisi = { oran: targetMatch.oddsHome ?? 0, kasa_yuzdesi: 0, edge: 0, tavsiye: "Bahis Yapma (Değersiz Oran)" };
  let kellyDraw: KellyOnerisi = { oran: targetMatch.oddsDraw ?? 0, kasa_yuzdesi: 0, edge: 0, tavsiye: "Bahis Yapma (Değersiz Oran)" };
  let kellyAway: KellyOnerisi = { oran: targetMatch.oddsAway ?? 0, kasa_yuzdesi: 0, edge: 0, tavsiye: "Bahis Yapma (Değersiz Oran)" };

  const calcKelly = (prob: number, odds: number | null | undefined): KellyOnerisi => {
    const o = odds ?? 0;
    if (o <= 1.0) return { oran: o, kasa_yuzdesi: 0, edge: 0, tavsiye: "D�KKAT: Model edge piyasay� yenememektedir, bahis tavsiye edilmez." };
    const edge = prob - (1.0 / o);
    return {
      oran: o,
      kasa_yuzdesi: 0,
      edge: Math.round(edge * 1000) / 10,
      tavsiye: "D�KKAT: Model edge piyasay� yenememektedir, bahis tavsiye edilmez."
    };
  };
  };

  kellyHome = calcKelly(finalHomePct / 100, targetMatch.oddsHome);
  kellyDraw = calcKelly(finalDrawPct / 100, targetMatch.oddsDraw);
  kellyAway = calcKelly(finalAwayPct / 100, targetMatch.oddsAway);

  // Live Backtesting Favorite ROI & Predictability
  let totalReturn = 0;
  let betCount = 0;
  for (const m of referenceMatches) {
    const o1 = m.oddsHome ?? 0;
    const ox = m.oddsDraw ?? 0;
    const o2 = m.oddsAway ?? 0;
    if (o1 <= 0 || ox <= 0 || o2 <= 0) continue;

    const minOdds = Math.min(o1, o2);
    if (minOdds > 2.5) continue;

    betCount++;
    const ft = parseScore(m.ftScore);
    if (!ft) {
      totalReturn -= 1.0;
      continue;
    }

    if (o1 < o2) {
      if (ft.home > ft.away) totalReturn += (o1 - 1.0);
      else totalReturn -= 1.0;
    } else {
      if (ft.away > ft.home) totalReturn += (o2 - 1.0);
      else totalReturn -= 1.0;
    }
  }

  const modelRoi = betCount > 0 ? Math.round((totalReturn / betCount) * 100 * 10) / 10 : 0;
  let predictability = "ORTA";
  if (betCount >= 5) {
    if (modelRoi > 5.0) predictability = "YUKSEK";
    else if (modelRoi < -5.0) predictability = "DUSUK";
  }

  const analiz_yuzde_str =
    total > 0
      ? `${finalHomePct}-${finalDrawPct}-${finalAwayPct}`
      : '0-0-0';

  const ortKorner  = kornerCount > 0 ? Math.round((totalKorner / kornerCount) * 10) / 10 : null;
  const bttsPct    = finalBttsPct;
  const over25Pct  = finalOver25Pct;
  const avgCards   = cardCount > 0 ? totalCards / cardCount : 0;

  const getCommonFreqShrinkage = (freq: Record<string, number>, baselineProb: number): string | null => {
    const entries = Object.entries(freq);
    if (!entries.length) return null;
    entries.sort((a, b) => {
      const pctA = (a[1] + M * baselineProb) / (total + M);
      const pctB = (b[1] + M * baselineProb) / (total + M);
      return pctB - pctA;
    });
    return entries[0][0];
  };

  const sikMs = getCommonFreqShrinkage(ftFreq, 0.10); // 10% baseline for a specific score
  const sikIy = getCommonFreqShrinkage(htFreq, 0.15); // 15% baseline for a specific HT score

  const statGroupWeighted = (count: number, total: number, weightedPct: number, label: string) => {
    return { sayi: count, yuzde: weightedPct, label: `${label} ${count}/${total} (${weightedPct}%)` };
  };

  // ── 2. Analiz özet ────────────────────────────────────────────────────────

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
    effective_sample_size: effectiveSampleSize,
    kalibrasyon_skoru,
    lig_dagilimi,
    ev_sahibi: { sayi: homeWins, yuzde: finalHomePct, sapma: sdHome, label: `Ev Sahibi (MS1) %${finalHomePct}` },
    beraberlik: { sayi: draws, yuzde: finalDrawPct, sapma: sdDraw, label: `Beraberlik (MS0) %${finalDrawPct}` },
    deplasman: { sayi: awayWins, yuzde: finalAwayPct, sapma: sdAway, label: `Deplasman (MS2) %${finalAwayPct}` },
    kg_var: { sayi: bttsCount, yuzde: finalBttsPct, sapma: sdBtts, label: `Karşılıklı Gol Var %${finalBttsPct}` },
    ust_25: { sayi: over25Count, yuzde: finalOver25Pct, sapma: sdOver25, label: `2.5 Üst %${finalOver25Pct}` },

    ust_35:     statGroupWeighted(over35Count, total, finalOver35Pct, '3.5 Üst'),
      ust_45:     statGroupWeighted(over45Count, total, Math.round((over45Count / Math.max(simSum, 0.001)) * 100), '4.5 Üst'),
      gol_6_plus: statGroupWeighted(gol6PlusCount, total, Number(((gol6PlusCount / Math.max(simSum, 0.001)) * 100).toFixed(1)), '6+ Gol'),
      iy_ms_1_2:  statGroupWeighted(iyMs1_2Count, total, Number(((iyMs1_2Count / Math.max(simSum, 0.001)) * 100).toFixed(1)), '1/2'),
      iy_ms_2_1:  statGroupWeighted(iyMs2_1Count, total, Number(((iyMs2_1Count / Math.max(simSum, 0.001)) * 100).toFixed(1)), '2/1'),
    iy_ust_15:  statGroupWeighted(iyOver15Count, htValidCount > 0 ? htValidCount : 1, finalIyOver15Pct, 'İY 1.5 Üst'),
    iy_ust_05:  statGroupWeighted(iyOver05Count, htValidCount > 0 ? htValidCount : 1, finalIyOver05Pct, 'İY 0.5 Üst'),
    ort_kart:      Math.round(avgCards * 10) / 10,
    ort_korner:    ortKorner,
    ust_10_korner: statGroupWeighted(ust10CornerCount, kornerCount > 0 ? kornerCount : 1, cornerPctWeighted, '10+ Korner'),
    sik_ms:        sikMs,
    sik_iy:        sikIy,
    guvenlik_skoru: avgSim,
    guven_seviyesi: guvenSeviyesi,
    guven_skoru: guvenSkoru,
    kelly_onerileri: {
      ev_sahibi: kellyHome,
      beraberlik: kellyDraw,
      deplasman: kellyAway
    },
    model_roi: modelRoi,
    predictability: predictability
  };

  // ── 3. Tahminler ─────────────────────────────────────────────────────────
              const tahminler: string[] = [];

    if (total < 5 || effectiveSampleSize < 5) {
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
          tahminler.push('İY | ' + sikIy + ' Skor');
        }
      }


    }

    // ⚽ 4. Tablo satırları 
    const tablo_satirlari: TabloSatiri[] = [];

  // Target match row (no real scores yet)
  const t = targetMatch;

  let ligSirasiHome = t.ligSirasiHome;
  let ligSirasiAway = t.ligSirasiAway;
  let ligSirasiTotal = t.ligSirasiTotal;

  if (ligSirasiHome == null && t.league && t.homeTeam) {
    const fallback = getTeamStandingsFallback(t.league, t.homeTeam);
    if (fallback) {
      ligSirasiHome = fallback.position;
      if (ligSirasiTotal == null) ligSirasiTotal = fallback.totalTeams;
    }
  }
  if (ligSirasiAway == null && t.league && t.awayTeam) {
    const fallback = getTeamStandingsFallback(t.league, t.awayTeam);
    if (fallback) {
      ligSirasiAway = fallback.position;
      if (ligSirasiTotal == null) ligSirasiTotal = fallback.totalTeams;
    }
  }

  const getTrend = (acilis: any, kapanis: any): 'up' | 'down' | 'flat' | null => {
    const a = parseFloat(acilis);
    const k = parseFloat(kapanis);
    if (isNaN(a) || isNaN(k) || a <= 0 || k <= 0) return null;
    if (k < a - 0.01) return 'down';
    if (k > a + 0.01) return 'up';
    return 'flat';
  };

  tablo_satirlari.push({
    id: 'target',
      is_target: true,
      analiz_yuzde: analiz_yuzde_str,
    iy_skor: null,
    iy_skor_renk: null,
    iy_skor_sik_mi: false,
    ms_skor: null,
    ms_skor_renk: null,
    ms_skor_sik_mi: false,
    iy_tahmini: sikIy ?? null,
    ms_tahmini: sikMs ?? null,
    row_renk: 'row-target',
    takimlar: `- ${t.homeTeam} - ${t.awayTeam} -`,
    tarih_lig: t.league ? `${t.league} - ${t.date ? t.date.slice(-4) : ''}` : '',
    is_highlight: true,
    onceki_skor: '',
    kirmizi_kart_var_mi: false,
    kart_display: '',
    kart_yuksek_mi: false,
    lig_sirasi:
      ligSirasiHome != null && ligSirasiAway != null
        ? `${ligSirasiHome}-${ligSirasiAway}/${ligSirasiTotal ?? 20}`
        : '',
    korner_display: '',
    taraf_oranlari: {
      ev:  fmtOdds(t.oddsHome),
      ber: fmtOdds(t.oddsDraw),
      dep: fmtOdds(t.oddsAway),
      kazanan: null,
      ev_acilis: fmtOdds((t as any).oran_1_acilis),
      ber_acilis: fmtOdds((t as any).oran_x_acilis),
      dep_acilis: fmtOdds((t as any).oran_2_acilis),
      ev_kapanis: fmtOdds((t as any).oran_1_kapanis ?? t.oddsHome),
      ber_kapanis: fmtOdds((t as any).oran_x_kapanis ?? t.oddsDraw),
      dep_kapanis: fmtOdds((t as any).oran_2_kapanis ?? t.oddsAway),
      ev_trend: getTrend((t as any).oran_1_acilis, (t as any).oran_1_kapanis ?? t.oddsHome),
      ber_trend: getTrend((t as any).oran_x_acilis, (t as any).oran_x_kapanis ?? t.oddsDraw),
      dep_trend: getTrend((t as any).oran_2_acilis, (t as any).oran_2_kapanis ?? t.oddsAway),
    } as any,
    alt_ust: {
      alt: fmtOdds(t.altOdds),
      ust: fmtOdds(t.ustOdds),
      kazanan: null,
      alt_acilis: fmtOdds((t as any).alt_orani_acilis),
      ust_acilis: fmtOdds((t as any).ust_orani_acilis),
      alt_kapanis: fmtOdds((t as any).alt_orani_kapanis ?? t.altOdds),
      ust_kapanis: fmtOdds((t as any).ust_orani_kapanis ?? t.ustOdds),
      alt_trend: getTrend((t as any).alt_orani_acilis, (t as any).alt_orani_kapanis ?? t.altOdds),
      ust_trend: getTrend((t as any).ust_orani_acilis, (t as any).ust_orani_kapanis ?? t.ustOdds),
    } as any,
    alt_ust_35: {
      alt: fmtOdds(t.altOdds35),
      ust: fmtOdds(t.ustOdds35),
      kazanan: null,
      alt_acilis: fmtOdds((t as any).alt_orani_35_acilis),
      ust_acilis: fmtOdds((t as any).ust_orani_35_acilis),
      alt_kapanis: fmtOdds((t as any).alt_orani_35_kapanis ?? t.altOdds35),
      ust_kapanis: fmtOdds((t as any).ust_orani_35_kapanis ?? t.ustOdds35),
      alt_trend: getTrend((t as any).alt_orani_35_acilis, (t as any).alt_orani_35_kapanis ?? t.altOdds35),
      ust_trend: getTrend((t as any).ust_orani_35_acilis, (t as any).ust_orani_35_kapanis ?? t.ustOdds35),
    } as any,
    iy_alt_ust_15: {
      alt: fmtOdds(t.iyAltOdds15),
      ust: fmtOdds(t.iyUstOdds15),
      kazanan: null,
      alt_acilis: fmtOdds((t as any).iy_alt_orani_15_acilis),
      ust_acilis: fmtOdds((t as any).iy_ust_orani_15_acilis),
      alt_kapanis: fmtOdds((t as any).iy_alt_orani_15_kapanis ?? t.iyAltOdds15),
      ust_kapanis: fmtOdds((t as any).iy_ust_orani_15_kapanis ?? t.iyUstOdds15),
      alt_trend: getTrend((t as any).iy_alt_orani_15_acilis, (t as any).iy_alt_orani_15_kapanis ?? t.iyAltOdds15),
      ust_trend: getTrend((t as any).iy_ust_orani_15_acilis, (t as any).iy_ust_orani_15_kapanis ?? t.iyUstOdds15),
    } as any,
    iy_alt_ust_05: {
      alt: fmtOdds(t.iyAltOdds05),
      ust: fmtOdds(t.iyUstOdds05),
      kazanan: null,
      alt_acilis: fmtOdds((t as any).iy_alt_orani_05_acilis),
      ust_acilis: fmtOdds((t as any).iy_ust_orani_05_acilis),
      alt_kapanis: fmtOdds((t as any).iy_alt_orani_05_kapanis ?? t.iyAltOdds05),
      ust_kapanis: fmtOdds((t as any).iy_ust_orani_05_kapanis ?? t.iyUstOdds05),
      alt_trend: getTrend((t as any).iy_alt_orani_05_acilis, (t as any).iy_alt_orani_05_kapanis ?? t.iyAltOdds05),
      ust_trend: getTrend((t as any).iy_ust_orani_05_acilis, (t as any).iy_ust_orani_05_kapanis ?? t.iyUstOdds05),
    } as any,
    var_yok: {
      var: fmtOdds(t.varOdds),
      yok: fmtOdds(t.yokOdds),
      kazanan: null,
      var_acilis: fmtOdds((t as any).kg_var_acilis),
      yok_acilis: fmtOdds((t as any).kg_yok_acilis),
      var_kapanis: fmtOdds((t as any).kg_var_kapanis ?? t.varOdds),
      yok_kapanis: fmtOdds((t as any).kg_yok_kapanis ?? t.yokOdds),
      var_trend: getTrend((t as any).kg_var_acilis, (t as any).kg_var_kapanis ?? t.varOdds),
      yok_trend: getTrend((t as any).kg_yok_acilis, (t as any).kg_yok_kapanis ?? t.yokOdds),
    } as any,
    ortalama: calcOrtalamaString(t),
    im_sonuc: '',
    im_renk: '',
  });

  // Reference match rows
  referenceMatches.forEach((m, idx) => {
    const ft = parseScore(m.ftScore);
    const ht = parseScore(m.htScore);



    // Odds winner derivation from actual result
    const oddsWinner: OddsWinner = resultType(m.ftScore);

    const totalGoalsFt = ft ? ft.home + ft.away : 0;
    const altUstWinner: AltUstWinner =
      ft ? (totalGoalsFt > 2.5 ? 'ust' : 'alt') : null;

    const altUstWinner35: AltUstWinner =
      ft ? (totalGoalsFt > 3.5 ? 'ust' : 'alt') : null;

    const totalGoalsHt = ht ? ht.home + ht.away : 0;
    const iyAltUstWinner15: AltUstWinner =
      ht ? (totalGoalsHt > 1.5 ? 'ust' : 'alt') : null;

    const iyAltUstWinner05: AltUstWinner =
      ht ? (totalGoalsHt > 0.5 ? 'ust' : 'alt') : null;

    const btts = ft ? (ft.home > 0 && ft.away > 0) : false;
    const varYokWinner: VarYokWinner = ft ? (btts ? 'var' : 'yok') : null;

    const totalMatchCards =
      (m.yellowCardsHome ?? 0) + (m.yellowCardsAway ?? 0) + (m.redCards ?? 0);

    const ftKey = ft ? `${ft.home}:${ft.away}` : null;
    const htKey = ht ? `${ht.home}:${ht.away}` : null;

    tablo_satirlari.push({
      id: m.id ?? `ref-${idx + 1}`,
      is_target: false,
      analiz_yuzde: (m as any).similarityScore ? `%${(m as any).similarityScore}` : analiz_yuzde_str,
      iy_skor: htKey ?? null,
      iy_skor_renk: scoreClass(m.htScore),
      iy_skor_sik_mi: !!htKey && htKey === sikIy,
      ms_skor: ftKey ?? null,
      ms_skor_renk: scoreClass(m.ftScore),
      ms_skor_sik_mi: !!ftKey && ftKey === sikMs,
      iy_tahmini: null,
      ms_tahmini: null,
      row_renk: rowClass(m.ftScore),
      takimlar: `- ${m.homeTeam} - ${m.awayTeam} -`,
      tarih_lig: (m as any).league ? `${(m as any).league} - ${((m as any).matchDate || (m as any).tarih || '').slice(-4)}` : '',
      is_highlight: false,
      onceki_skor: m.previousScore ?? '',
      kirmizi_kart_var_mi: (m.redCards ?? 0) > 0,
      kart_display:
        (m.yellowCardsHome != null || m.yellowCardsAway != null)
          ? `${fmtCard(m.yellowCardsHome)} - ${fmtCard(m.yellowCardsAway)} - ${m.redCards ?? 0}`
          : '',
      kart_yuksek_mi: totalMatchCards >= 5,
      lig_sirasi:
        m.ligSirasiHome != null && m.ligSirasiAway != null
          ? `${m.ligSirasiHome}-${m.ligSirasiAway}/${m.ligSirasiTotal ?? 20}`
          : '',
      taraf_oranlari: {
        ev:  fmtOdds(m.oddsHome),
        ber: fmtOdds(m.oddsDraw),
        dep: fmtOdds(m.oddsAway),
        kazanan: oddsWinner,
        ev_acilis: fmtOdds((m as any).oran_1_acilis),
        ber_acilis: fmtOdds((m as any).oran_x_acilis),
        dep_acilis: fmtOdds((m as any).oran_2_acilis),
        ev_kapanis: fmtOdds((m as any).oran_1_kapanis),
        ber_kapanis: fmtOdds((m as any).oran_x_kapanis),
        dep_kapanis: fmtOdds((m as any).oran_2_kapanis),
        ev_trend: getTrend((m as any).oran_1_acilis, (m as any).oran_1_kapanis ?? m.oddsHome),
        ber_trend: getTrend((m as any).oran_x_acilis, (m as any).oran_x_kapanis ?? m.oddsDraw),
        dep_trend: getTrend((m as any).oran_2_acilis, (m as any).oran_2_kapanis ?? m.oddsAway),
      } as any,
      alt_ust: {
        alt: fmtOdds(m.altOdds),
        ust: fmtOdds(m.ustOdds),
        kazanan: altUstWinner,
        alt_acilis: fmtOdds((m as any).alt_orani_acilis),
        ust_acilis: fmtOdds((m as any).ust_orani_acilis),
        alt_kapanis: fmtOdds((m as any).alt_orani_kapanis),
        ust_kapanis: fmtOdds((m as any).ust_orani_kapanis),
        alt_trend: getTrend((m as any).alt_orani_acilis, (m as any).alt_orani_kapanis ?? m.altOdds),
        ust_trend: getTrend((m as any).ust_orani_acilis, (m as any).ust_orani_kapanis ?? m.ustOdds),
      } as any,
      alt_ust_35: {
        alt: fmtOdds(m.altOdds35),
        ust: fmtOdds(m.ustOdds35),
        kazanan: altUstWinner35,
        alt_acilis: fmtOdds((m as any).alt_orani_35_acilis),
        ust_acilis: fmtOdds((m as any).ust_orani_35_acilis),
        alt_kapanis: fmtOdds((m as any).alt_orani_35_kapanis),
        ust_kapanis: fmtOdds((m as any).ust_orani_35_kapanis),
        alt_trend: getTrend((m as any).alt_orani_35_acilis, (m as any).alt_orani_35_kapanis ?? m.altOdds35),
        ust_trend: getTrend((m as any).ust_orani_35_acilis, (m as any).ust_orani_35_kapanis ?? m.ustOdds35),
      } as any,
      iy_alt_ust_15: {
        alt: fmtOdds(m.iyAltOdds15),
        ust: fmtOdds(m.iyUstOdds15),
        kazanan: iyAltUstWinner15,
        alt_acilis: fmtOdds((m as any).iy_alt_orani_15_acilis),
        ust_acilis: fmtOdds((m as any).iy_ust_orani_15_acilis),
        alt_kapanis: fmtOdds((m as any).iy_alt_orani_15_kapanis),
        ust_kapanis: fmtOdds((m as any).iy_ust_orani_15_kapanis),
        alt_trend: getTrend((m as any).iy_alt_orani_15_acilis, (m as any).iy_alt_orani_15_kapanis ?? m.iyAltOdds15),
        ust_trend: getTrend((m as any).iy_ust_orani_15_acilis, (m as any).iy_ust_orani_15_kapanis ?? m.iyUstOdds15),
      } as any,
      iy_alt_ust_05: {
        alt: fmtOdds(m.iyAltOdds05),
        ust: fmtOdds(m.iyUstOdds05),
        kazanan: iyAltUstWinner05,
        alt_acilis: fmtOdds((m as any).iy_alt_orani_05_acilis),
        ust_acilis: fmtOdds((m as any).iy_ust_orani_05_acilis),
        alt_kapanis: fmtOdds((m as any).iy_alt_orani_05_kapanis),
        ust_kapanis: fmtOdds((m as any).iy_ust_orani_05_kapanis),
        alt_trend: getTrend((m as any).iy_alt_orani_05_acilis, (m as any).iy_alt_orani_05_kapanis ?? m.iyAltOdds05),
        ust_trend: getTrend((m as any).iy_ust_orani_05_acilis, (m as any).iy_ust_orani_05_kapanis ?? m.iyUstOdds05),
      } as any,
      var_yok: {
        var: fmtOdds(m.varOdds),
        yok: fmtOdds(m.yokOdds),
        kazanan: varYokWinner,
        var_acilis: fmtOdds((m as any).kg_var_acilis),
        yok_acilis: fmtOdds((m as any).kg_yok_acilis),
        var_kapanis: fmtOdds((m as any).kg_var_kapanis),
        yok_kapanis: fmtOdds((m as any).kg_yok_kapanis),
        var_trend: getTrend((m as any).kg_var_acilis, (m as any).kg_var_kapanis ?? m.varOdds),
        yok_trend: getTrend((m as any).kg_yok_acilis, (m as any).kg_yok_kapanis ?? m.yokOdds),
      } as any,
      ortalama: calcOrtalamaString(m),
      korner_display:
        m.kornerHome != null || m.kornerAway != null
          ? `${m.kornerHome ?? '-'}-${m.kornerAway ?? '-'} (${(m.kornerHome ?? 0) + (m.kornerAway ?? 0)})`
          : '',
      im_sonuc: m.imResult || (() => {
        const ht = parseScore(m.htScore);
        const ft = parseScore(m.ftScore);
        if (!ht || !ft) return '';
        const _ht = ht.home > ht.away ? '1' : (ht.home < ht.away ? '2' : 'X');
        const _ft = ft.home > ft.away ? '1' : (ft.home < ft.away ? '2' : 'X');
        return `${_ht}/${_ft}`;
      })(),
      im_renk: imRenk(m.imResult || (() => {
        const ht = parseScore(m.htScore);
        const ft = parseScore(m.ftScore);
        if (!ht || !ft) return '';
        const _ht = ht.home > ht.away ? '1' : (ht.home < ht.away ? '2' : 'X');
        const _ft = ft.home > ft.away ? '1' : (ft.home < ft.away ? '2' : 'X');
        return `${_ht}/${_ft}`;
      })()),
    });
  });

  return { 
    analiz_ozet, 
    tahminler, 
    tablo_satirlari,
    poisson_probs: {
      pHome: pHomeWin,
      pDraw: pDraw,
      pAway: pAwayWin,
      pOver25: pOver25,
      pBtts: pBtts
    }
  };
}

export interface ModelDResult {
  p_home: number;
  p_draw: number;
  p_away: number;
  p_over25: number;
  p_btts: number;
  real_edge_home: number;
  real_edge_draw: number;
  real_edge_away: number;
  real_edge_over25: number;
  real_edge_btts: number;
  stake_home: number;
  stake_draw: number;
  stake_away: number;
  stake_over25: number;
  stake_btts: number;
  tahminler: string[];
}

/**
 * Model D — Market-Calibrated Trading Engine
 * 1. Market-specific consensus weighting (Goals: 60/40, Sides: 40/60)
 * 2. Value-adjusted Quarter-Kelly stake sizing
 * 3. Dynamic odds-band confidence threshold
 * 4. Sample-weighted Real Edge score
 */
export function calculateModelD(
  targetMatch: AnalyzeTargetMatch,
  referenceMatches: AnalyzeRefMatch[],
  config?: AnalyzeConfig
): ModelDResult {
  const modelA = analyze(targetMatch, referenceMatches, config);
  const ozet = modelA.analiz_ozet;
  const N_benzer = ozet.total_mac;

  // Formül 4: Sample Confidence Factor
  const sample_factor = Math.min(1.0, N_benzer / 50.0);

  // Formül 1: Market-Özel Consensus Ağırlıkları
  // Goals (2.5 & BTTS): alpha = 0.60 (60% Sim, 40% Poisson)
  // Sides (1X2): alpha = 0.40 (40% Sim, 60% Poisson)
  const alpha_goals = 0.60;
  const alpha_sides = 0.40;

  const simHome = ozet.ev_sahibi.yuzde / 100.0;
  const simDraw = ozet.beraberlik.yuzde / 100.0;
  const simAway = ozet.deplasman.yuzde / 100.0;
  const simOver = ozet.ust_25.yuzde / 100.0;
  const simBtts = ozet.kg_var.yuzde / 100.0;

  // Derive raw Poisson probabilities from modelA
  const pHome = modelA.poisson_probs?.pHome ?? simHome;
  const pDraw = modelA.poisson_probs?.pDraw ?? simDraw;
  const pAway = modelA.poisson_probs?.pAway ?? simAway;
  const pOver = modelA.poisson_probs?.pOver25 ?? simOver;
  const pBtts = modelA.poisson_probs?.pBtts ?? simBtts;

  // Blended probabilities
  const p_home = alpha_sides * simHome + (1.0 - alpha_sides) * pHome;
  const p_draw = alpha_sides * simDraw + (1.0 - alpha_sides) * pDraw;
  const p_away = alpha_sides * simAway + (1.0 - alpha_sides) * pAway;
  const p_over25 = alpha_goals * simOver + (1.0 - alpha_goals) * pOver;
  const p_btts = alpha_goals * simBtts + (1.0 - alpha_goals) * pBtts;

  const oH = targetMatch.oddsHome ?? 0;
  const oD = targetMatch.oddsDraw ?? 0;
  const oA = targetMatch.oddsAway ?? 0;
  const oOver = targetMatch.ustOdds ?? 0;
  const oBtts = targetMatch.varOdds ?? 0;

  const getEdge = (p: number, o: number) => o > 1.0 ? (p - 1.0 / o) * sample_factor : 0;
  const real_edge_home = getEdge(p_home, oH);
  const real_edge_draw = getEdge(p_draw, oD);
  const real_edge_away = getEdge(p_away, oA);
  const real_edge_over25 = getEdge(p_over25, oOver);
  const real_edge_btts = getEdge(p_btts, oBtts);

  // Formül 2: Value-adjusted Quarter-Kelly (Max 3.5% instead of 10% to match analyzeEngine's default max risk)
  const calcStake = (p: number, o: number) => {
    if (o <= 1.0) return 0;
    const b = o - 1.0;
    const f = (p * b - (1.0 - p)) / b;
    return Math.max(0, Math.min(0.035, f * 0.25));
  };

  const stake_home = calcStake(p_home, oH);
  const stake_draw = calcStake(p_draw, oD);
  const stake_away = calcStake(p_away, oA);
  const stake_over25 = calcStake(p_over25, oOver);
  const stake_btts = calcStake(p_btts, oBtts);

  // Formül 3: Oran Bandına Göre Dinamik Güven Eşiği
  const beta = 0.15;
  const reqProb = (odds: number) => 0.65 + beta * Math.max(0, 1.40 - odds);

  const tahminler: string[] = [];
  if (p_home >= reqProb(oH) && real_edge_home > 0) tahminler.push(`DA | 1 (Edge: +${(real_edge_home * 100).toFixed(1)}%)`);
  if (p_away >= reqProb(oA) && real_edge_away > 0) tahminler.push(`DA | 2 (Edge: +${(real_edge_away * 100).toFixed(1)}%)`);
  if (p_over25 >= reqProb(oOver) && real_edge_over25 > 0) tahminler.push(`MS | 2,5 ÜST (Edge: +${(real_edge_over25 * 100).toFixed(1)}%)`);
  if (p_btts >= reqProb(oBtts) && real_edge_btts > 0) tahminler.push(`MS | KG VAR (Edge: +${(real_edge_btts * 100).toFixed(1)}%)`);

  return {
    p_home, p_draw, p_away, p_over25, p_btts,
    real_edge_home, real_edge_draw, real_edge_away, real_edge_over25, real_edge_btts,
    stake_home, stake_draw, stake_away, stake_over25, stake_btts,
    tahminler
  };
}




