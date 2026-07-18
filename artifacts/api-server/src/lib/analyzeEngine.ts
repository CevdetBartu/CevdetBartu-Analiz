/**
 * Football Statistics Analysis Engine
 * Accepts a target match + reference matches, returns a render-ready JSON.
 */

export interface AnalyzeRefMatch {
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
  avgOddsMin?: number | null;
  avgOddsMax?: number | null;
  imResult?: string | null;
  kornerHome?: number | null;
  kornerAway?: number | null;
  similarityScore?: number | null;
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
  avgOddsMin?: number | null;
  avgOddsMax?: number | null;
}

// ─── Output types ────────────────────────────────────────────────────────────

export interface StatGroup {
  sayi: number;
  yuzde: number;
  label: string;
}

export interface AnalyzeOzet {
  total_mac: number;
  ev_sahibi: StatGroup;
  beraberlik: StatGroup;
  deplasman: StatGroup;
  kg_var: StatGroup;
  ust_25: StatGroup;
  ort_kart: number;
  ort_korner: number | null;
  ust_10_korner: StatGroup;
  sik_ms: string | null;
  sik_iy: string | null;
  guvenlik_skoru?: number | null;
  guven_seviyesi?: string | null;
}

export type OddsWinner = 'ev' | 'ber' | 'dep' | null;
export type AltUstWinner = 'alt' | 'ust' | null;
export type VarYokWinner = 'var' | 'yok' | null;

export interface TarafOranlari {
  ev: string | null;
  ber: string | null;
  dep: string | null;
  kazanan: OddsWinner;
}

export interface AltUst {
  alt: string | null;
  ust: string | null;
  kazanan: AltUstWinner;
}

export interface VarYok {
  var: string | null;
  yok: string | null;
  kazanan: VarYokWinner;
}

export interface TabloSatiri {
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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseScore(s: string | null | undefined): { home: number; away: number } | null {
  if (!s) return null;
  const m = s.trim().replace(/\s/g, '').match(/^(\d+)[:\-](\d+)$/);
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

function fmtOdds(v: number | null | undefined): string | null {
  if (v == null) return null;
  return v.toFixed(2).replace('.', ',');
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

function imRenk(im: string | null | undefined): string {
  if (!im) return '';
  if (im === '2/1') return 'im-special';
  if (im === '1/1') return 'im-good';
  return '';
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export function analyze(
  targetMatch: AnalyzeTargetMatch,
  referenceMatches: AnalyzeRefMatch[]
): AnalyzeResponse {
  const total = referenceMatches.length;

  // ── 1. Aggregate stats ────────────────────────────────────────────────────
  let homeWins = 0, draws = 0, awayWins = 0;
  let bttsCount = 0, over25Count = 0;
  let totalGoals = 0, totalCards = 0;
  let totalKorner = 0, kornerCount = 0, ust10KornerCount = 0;
  const htFreq: Record<string, number> = {};
  const ftFreq: Record<string, number> = {};

  let simSum = 0;
  let homeWinsWeighted = 0;
  let drawsWeighted = 0;
  let awayWinsWeighted = 0;
  let bttsWeighted = 0;
  let over25Weighted = 0;
  const simScores: number[] = [];

  for (const m of referenceMatches) {
    const sim = m.similarityScore ?? 100;
    simScores.push(sim);
    simSum += sim;

    const ft = parseScore(m.ftScore);
    if (!ft) continue;

    if (ft.home > ft.away) {
      homeWins++;
      homeWinsWeighted += sim;
    } else if (ft.home < ft.away) {
      awayWins++;
      awayWinsWeighted += sim;
    } else {
      draws++;
      drawsWeighted += sim;
    }

    const goals = ft.home + ft.away;
    totalGoals += goals;
    if (ft.home > 0 && ft.away > 0) {
      bttsCount++;
      bttsWeighted += sim;
    }
    if (goals > 2.5) {
      over25Count++;
      over25Weighted += sim;
    }

    // FT score freq
    const ftKey = `${ft.home}:${ft.away}`;
    ftFreq[ftKey] = (ftFreq[ftKey] ?? 0) + 1;

    // HT score freq
    const ht = parseScore(m.htScore);
    if (ht) {
      const htKey = `${ht.home}:${ht.away}`;
      htFreq[htKey] = (htFreq[htKey] ?? 0) + 1;
    }

    // Cards (all matches counted, even 0)
    totalCards +=
      (m.yellowCardsHome ?? 0) +
      (m.yellowCardsAway ?? 0) +
      (m.redCards ?? 0);

    // Korner istatistikleri
    if (m.kornerHome != null || m.kornerAway != null) {
      const mk = (m.kornerHome ?? 0) + (m.kornerAway ?? 0);
      totalKorner += mk;
      kornerCount++;
      if (mk >= 10) ust10KornerCount++;
    }
  }

  const homePctWeighted = simSum > 0 ? Math.round((homeWinsWeighted / simSum) * 100) : 0;
  const drawPctWeighted = simSum > 0 ? Math.round((drawsWeighted / simSum) * 100) : 0;
  const awayPctWeighted = simSum > 0 ? Math.round((awayWinsWeighted / simSum) * 100) : 0;
  const bttsPctWeighted = simSum > 0 ? Math.round((bttsWeighted / simSum) * 100) : 0;
  const over25PctWeighted = simSum > 0 ? Math.round((over25Weighted / simSum) * 100) : 0;

  const avgSim = simScores.length > 0 ? Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length) : null;
  let guvenSeviyesi: string | null = null;
  if (avgSim !== null) {
    if (avgSim >= 80) guvenSeviyesi = "YUKSEK";
    else if (avgSim >= 72) guvenSeviyesi = "ORTA";
    else guvenSeviyesi = "DUSUK";
  }

  const analiz_yuzde_str =
    total > 0
      ? `${homePctWeighted}-${drawPctWeighted}-${awayPctWeighted}`
      : '0-0-0';

  const bttsPct    = bttsPctWeighted;
  const ortKorner  = kornerCount > 0 ? Math.round((totalKorner / kornerCount) * 10) / 10 : null;
  const over25Pct  = over25PctWeighted;
  const avgCards   = total > 0 ? totalCards / total : 0;

  const sikMs = mostCommon(ftFreq);
  const sikIy = mostCommon(htFreq);

  const statGroupWeighted = (count: number, total: number, weightedPct: number, label: string) => {
    return { sayi: count, yuzde: weightedPct, label: `${label} ${count}/${total} (${weightedPct}%)` };
  };

  // ── 2. Analiz özet ────────────────────────────────────────────────────────
  const analiz_ozet: AnalyzeOzet = {
    total_mac: total,
    ev_sahibi:  statGroupWeighted(homeWins,    total, homePctWeighted, 'Ev'),
    beraberlik: statGroupWeighted(draws,       total, drawPctWeighted, 'X'),
    deplasman:  statGroupWeighted(awayWins,    total, awayPctWeighted, 'Dep'),
    kg_var:     statGroupWeighted(bttsCount,   total, bttsPctWeighted, 'KG Var'),
    ust_25:     statGroupWeighted(over25Count, total, over25PctWeighted, '2.5 Üst'),
    ort_kart:      Math.round(avgCards * 10) / 10,
    ort_korner:    ortKorner,
    ust_10_korner: statGroupWeighted(ust10KornerCount, kornerCount > 0 ? kornerCount : 1, kornerCount > 0 ? Math.round((ust10KornerCount / kornerCount) * 100) : 0, '10+ Korner'),
    sik_ms:        sikMs,
    sik_iy:        sikIy,
    guvenlik_skoru: avgSim,
    guven_seviyesi: guvenSeviyesi,
  };

  // ── 3. Tahminler ─────────────────────────────────────────────────────────
  const tahminler: string[] = [];

  // Dominant result
  const homePct  = analiz_ozet.ev_sahibi.yuzde;
  const drawPct  = analiz_ozet.beraberlik.yuzde;
  const awayPct  = analiz_ozet.deplasman.yuzde;
  if      (homePct >= 60) tahminler.push('DA | 1');
  else if (awayPct >= 60) tahminler.push('DA | 2');
  else if (drawPct >= 35) tahminler.push('DA | X');

  // Sık İY skoru (≥ 50%)
  if (sikIy) {
    const freq = htFreq[sikIy] ?? 0;
    if (total > 0 && (freq / total) * 100 >= 50) {
      tahminler.push(`İY | ${sikIy}`);
    }
  }

  // KG — 70% threshold
  tahminler.push(bttsPct >= 70 ? 'MS | KG VAR' : 'MS | KG YOK');

  // 2.5 — 70% threshold
  tahminler.push(over25Pct >= 70 ? 'MS | 2,5 ÜST' : 'MS | 2,5 ALT');

  // Kart
  tahminler.push(avgCards < 4.5 ? 'MS | (kart) 4,5 ALT' : 'MS | (kart) 4,5 ÜST');

  // Korner (en az 3 maç veri olmalı)
  if (ortKorner !== null && kornerCount >= 3) {
    tahminler.push(ortKorner >= 10 ? 'MS | (korner) 10+ ÜST' : 'MS | (korner) 10+ ALT');
  }

  // Sık MS skoru (≥ 50%)
  if (sikMs) {
    const freq = ftFreq[sikMs] ?? 0;
    if (total > 0 && (freq / total) * 100 >= 50) {
      tahminler.push(`MS | TGS ${sikMs}`);
    }
  }

  // ── 4. Tablo satırları ────────────────────────────────────────────────────
  const tablo_satirlari: TabloSatiri[] = [];

  // Target match row (no real scores yet)
  const t = targetMatch;
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
    is_highlight: true,
    onceki_skor: '',
    kirmizi_kart_var_mi: false,
    kart_display: '',
    kart_yuksek_mi: false,
    lig_sirasi:
      t.ligSirasiHome != null && t.ligSirasiAway != null
        ? `${t.ligSirasiHome}-${t.ligSirasiAway}/${t.ligSirasiTotal ?? 20}`
        : '',
    korner_display: '',
    taraf_oranlari: {
      ev:  fmtOdds(t.oddsHome),
      ber: fmtOdds(t.oddsDraw),
      dep: fmtOdds(t.oddsAway),
      kazanan: null,
    },
    alt_ust: {
      alt: fmtOdds(t.altOdds),
      ust: fmtOdds(t.ustOdds),
      kazanan: null,
    },
    var_yok: {
      var: fmtOdds(t.varOdds),
      yok: fmtOdds(t.yokOdds),
      kazanan: null,
    },
    ortalama:
      t.avgOddsMin != null && t.avgOddsMax != null
        ? `${fmtOdds(t.avgOddsMin)}-${fmtOdds(t.avgOddsMax)}`
        : '',
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

    const btts = ft ? (ft.home > 0 && ft.away > 0) : false;
    const varYokWinner: VarYokWinner = ft ? (btts ? 'var' : 'yok') : null;

    const totalMatchCards =
      (m.yellowCardsHome ?? 0) + (m.yellowCardsAway ?? 0) + (m.redCards ?? 0);

    const ftKey = ft ? `${ft.home}:${ft.away}` : null;
    const htKey = ht ? `${ht.home}:${ht.away}` : null;

    tablo_satirlari.push({
      id: m.id ?? `ref-${idx + 1}`,
      is_target: false,
      analiz_yuzde: analiz_yuzde_str,
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
      } as any,
      alt_ust: {
        alt: fmtOdds(m.altOdds),
        ust: fmtOdds(m.ustOdds),
        kazanan: altUstWinner,
        alt_acilis: fmtOdds((m as any).alt_orani_acilis),
        ust_acilis: fmtOdds((m as any).ust_orani_acilis),
        alt_kapanis: fmtOdds((m as any).alt_orani_kapanis),
        ust_kapanis: fmtOdds((m as any).ust_orani_kapanis),
      } as any,
      var_yok: {
        var: fmtOdds(m.varOdds),
        yok: fmtOdds(m.yokOdds),
        kazanan: varYokWinner,
        var_acilis: fmtOdds((m as any).kg_var_acilis),
        yok_acilis: fmtOdds((m as any).kg_yok_acilis),
        var_kapanis: fmtOdds((m as any).kg_var_kapanis),
        yok_kapanis: fmtOdds((m as any).kg_yok_kapanis),
      } as any,
      ortalama:
        m.avgOddsMin != null && m.avgOddsMax != null
          ? `${fmtOdds(m.avgOddsMin)}-${fmtOdds(m.avgOddsMax)}`
          : '',
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

  return { analiz_ozet, tahminler, tablo_satirlari };
}
