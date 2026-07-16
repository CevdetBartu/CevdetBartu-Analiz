import type { HistoricalMatch } from "@workspace/db";

export interface SimilarityQuery {
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  altOdds?: number | null;
  ustOdds?: number | null;
  varOdds?: number | null;
  yokOdds?: number | null;
  league?: string | null;
  ligSirasiDiff?: number | null;
  avgCardsTotal?: number | null;
  maxResults?: number | null;
}

export interface ScoreBreakdown {
  oddsScore: number;
  leagueScore: number;
  cardScore: number;
}

export interface SimilarMatchResult {
  match: HistoricalMatch;
  similarityScore: number;
  scoreBreakdown: ScoreBreakdown;
}

/** Max weights */
const W_ODDS = 60;
const W_LEAGUE = 20;
const W_CARD = 20;

/** Tolerance windows */
const MAIN_ODDS_TOL = 0.15;   // ±0.15 for 1/X/2
const ALT_ODDS_TOL = 0.10;    // ±0.10 for Alt/Üst & Var/Yok
const CARD_TOL = 1.5;          // ±1.5 average cards
const LIG_DIFF_WINDOW = 3;    // ±3 around target position diff

/** Score for a single odds pair — full points if within tolerance, partial for close misses */
function oddsScore(target: number, actual: number | string | null | undefined, tolerance: number): number {
  if (actual == null) return 0;
  const a = typeof actual === "string" ? parseFloat(actual) : actual;
  if (isNaN(a)) return 0;
  const diff = Math.abs(target - a);
  if (diff <= tolerance) {
    // Within tolerance: scale from 1.0 (perfect) to 0.5 (at edge)
    return 0.5 + 0.5 * (1 - diff / tolerance);
  }
  // Outside tolerance but within 2× — give partial credit that fades to 0
  if (diff <= tolerance * 2) {
    return 0.5 * (1 - (diff - tolerance) / tolerance);
  }
  return 0;
}

export function scoreMatch(query: SimilarityQuery, match: HistoricalMatch): SimilarMatchResult {
  // ─── 1. ORAN BENZERLİĞİ (60%) ─────────────────────────────────────────────
  const mHome = oddsScore(query.oddsHome, match.oddsHome, MAIN_ODDS_TOL);
  const mDraw = oddsScore(query.oddsDraw, match.oddsDraw, MAIN_ODDS_TOL);
  const mAway = oddsScore(query.oddsAway, match.oddsAway, MAIN_ODDS_TOL);

  // Main odds contribute 3/5 of oran weight
  let oddsRaw = (mHome + mDraw + mAway) / 3;  // 0–1

  // Alt/Üst & Var/Yok contribute 2/5 of oran weight if provided
  let auxCount = 0;
  let auxSum = 0;
  if (query.altOdds != null) { auxSum += oddsScore(query.altOdds, match.altOdds, ALT_ODDS_TOL); auxCount++; }
  if (query.ustOdds != null) { auxSum += oddsScore(query.ustOdds, match.ustOdds, ALT_ODDS_TOL); auxCount++; }
  if (query.varOdds != null) { auxSum += oddsScore(query.varOdds, match.varOdds, ALT_ODDS_TOL); auxCount++; }
  if (query.yokOdds != null) { auxSum += oddsScore(query.yokOdds, match.yokOdds, ALT_ODDS_TOL); auxCount++; }

  if (auxCount > 0) {
    const auxRaw = auxSum / auxCount;
    oddsRaw = oddsRaw * 0.6 + auxRaw * 0.4;
  }

  const oddsScore_ = Math.round(oddsRaw * W_ODDS * 10) / 10;

  // ─── 2. LİG & GÜÇ DENGESİ (20%) ──────────────────────────────────────────
  let leagueScore = 0;

  // Same league: up to 10 points
  if (query.league && match.league && query.league.trim().toLowerCase() === match.league.trim().toLowerCase()) {
    leagueScore += 10;
  } else if (query.league && match.league) {
    // Partial credit for same country (crude heuristic: first word)
    const qParts = query.league.toLowerCase().split(" ");
    const mParts = match.league.toLowerCase().split(" ");
    if (qParts[0] === mParts[0]) leagueScore += 4;
  }

  // League position diff: up to 10 points
  if (
    query.ligSirasiDiff != null &&
    match.ligSirasiHome != null &&
    match.ligSirasiAway != null
  ) {
    const matchDiff = Math.abs(match.ligSirasiHome - match.ligSirasiAway);
    const diff = Math.abs(query.ligSirasiDiff - matchDiff);
    if (diff <= LIG_DIFF_WINDOW) {
      leagueScore += 10 * (1 - diff / LIG_DIFF_WINDOW);
    } else if (diff <= LIG_DIFF_WINDOW * 2) {
      leagueScore += 5 * (1 - (diff - LIG_DIFF_WINDOW) / (LIG_DIFF_WINDOW * 2));
    }
  } else {
    // No data — give neutral half credit so missing data doesn't hurt too much
    leagueScore += 5;
  }

  leagueScore = Math.min(Math.round(leagueScore * 10) / 10, W_LEAGUE);

  // ─── 3. KART & OYUN TARZI (20%) ───────────────────────────────────────────
  let cardScore = 0;

  if (query.avgCardsTotal != null && match.yellowCardsHome != null && match.yellowCardsAway != null) {
    const matchCards =
      (match.yellowCardsHome ?? 0) + (match.yellowCardsAway ?? 0) + (match.redCards ?? 0);
    const diff = Math.abs(query.avgCardsTotal - matchCards);
    if (diff <= CARD_TOL) {
      cardScore = W_CARD * (1 - diff / CARD_TOL);
    } else if (diff <= CARD_TOL * 2) {
      cardScore = (W_CARD / 2) * (1 - (diff - CARD_TOL) / (CARD_TOL * 2));
    }
  } else {
    // No card data provided — neutral half credit
    cardScore = W_CARD * 0.5;
  }

  cardScore = Math.round(cardScore * 10) / 10;

  const similarityScore = Math.min(
    Math.round((oddsScore_ + leagueScore + cardScore) * 10) / 10,
    100
  );

  return {
    match,
    similarityScore,
    scoreBreakdown: {
      oddsScore: oddsScore_,
      leagueScore,
      cardScore,
    },
  };
}

export function findSimilarMatches(
  query: SimilarityQuery,
  allMatches: HistoricalMatch[]
): SimilarMatchResult[] {
  const maxResults = Math.min(Math.max(query.maxResults ?? 5, 3), 5);

  const scored = allMatches
    .map(m => scoreMatch(query, m))
    .sort((a, b) => b.similarityScore - a.similarityScore);

  // Return top N, ensuring at least 3 if available
  return scored.slice(0, maxResults);
}
