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
const ALT_ODDS_TOL = 0.06;    // ±0.06 for Alt/Üst & Var/Yok (Daraltıldı)
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


const countryMap: Record<string, string[]> = {
  "turkiye": ["turkey", "turkiye", "turkish", "süper lig", "tff", "1. lig"],
  "ingiltere": ["england", "ingiltere", "english", "premier league", "championship", "league one"],
  "ispanya": ["spain", "ispanya", "spanish", "la liga", "segunda"],
  "almanya": ["germany", "almanya", "german", "bundesliga", "2. bundesliga"],
  "italya": ["italy", "italya", "italian", "serie a", "serie b"],
  "fransa": ["france", "fransa", "french", "ligue 1", "ligue 2"],
  "hollanda": ["netherlands", "hollanda", "dutch", "eredivisie"],
  "portekiz": ["portugal", "portekiz", "portuguese", "primeira"],
  "abd": ["usa", "abd", "american", "united states", "major league soccer", "mls"],
  "brezilya": ["brazil", "brezilya", "brazilian", "serie a", "serie b"],
  "arjantin": ["argentina", "arjantin", "argentine", "liga profesional"],
  "norvec": ["norway", "norvec", "norwegian", "eliteserien"]
};



export function getLeagueContinent(leagueName?: string | null): string {
  if (!leagueName) return "UNKNOWN";
  const norm = leagueName.toLowerCase();
  
  if (norm.includes("uefa") || norm.includes("champions league") || norm.includes("europa") || norm.includes("euro")) return "EUROPE";
  if (norm.includes("libertadores") || norm.includes("sudamericana") || norm.includes("copa america")) return "SOUTH_AMERICA";
  if (norm.includes("afc") || norm.includes("asian")) return "ASIA";
  if (norm.includes("caf") || norm.includes("african")) return "AFRICA";
  if (norm.includes("concacaf") || norm.includes("gold cup")) return "NORTH_AMERICA";
  if (norm.includes("world cup") || norm.includes("fifa")) return "WORLD";

  // Domestic Mapping
  const europe = ["ingiltere", "almanya", "italya", "ispanya", "fransa", "turkiye", "hollanda", "portekiz", "belcika", "iskocya", "yunanistan", "rusya", "ukrayna", "isvicre", "avusturya", "isvec", "norvec", "danimarka", "polonya", "romanya", "sirbistan", "hirvatistan", "cek", "macaristan", "irlanda", "galler", "finlandiya", "izlanda", "slovakya", "slovenya", "bulgaristan", "bosna", "karadag", "makedonya", "kosova", "arnavutluk", "kibris", "gurcistan", "ermenistan", "azerbaycan", "kazakistan", "estonya", "letonya", "litvanya", "belarus", "galler", "kuzey irlanda"];
  const south_america = ["brezilya", "arjantin", "kolombiya", "sili", "peru", "uruguay", "ekvador", "paraguay", "bolivya", "venezuela"];
  const north_america = ["abd", "meksika", "kanada", "kosta rika", "honduras", "panama", "jamaika", "el salvador", "guatemala"];
  const asia = ["japonya", "guney kore", "cin", "avustralya", "iran", "suudi arabistan", "bae", "katar", "ozbekistan", "irak", "umman", "suriye", "urdun", "bahreyn", "kuveyt", "yemen", "lbnan", "filistin", "hindistan", "tayland", "vietnam", "malezya", "endonezya", "singapur"];
  const africa = ["misir", "fas", "cezayir", "tunus", "senegal", "nijerya", "kamerun", "fildisi", "gana", "mali", "guney afrika", "zambiya", "uganda", "kenya"];

  if (europe.some(c => norm.includes(c))) return "EUROPE";
  if (south_america.some(c => norm.includes(c))) return "SOUTH_AMERICA";
  if (north_america.some(c => norm.includes(c))) return "NORTH_AMERICA";
  if (asia.some(c => norm.includes(c))) return "ASIA";
  if (africa.some(c => norm.includes(c))) return "AFRICA";

  return "UNKNOWN";
}

export function isNationalTeamMatch(leagueName?: string | null): boolean {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  return norm.includes("world cup") || 
         norm.includes("dünya kupası") || 
         norm.includes("nations league") || 
         norm.includes("euro ") || 
         norm.includes("avrupa şampiyonası") || 
         norm.includes("copa america") || 
         norm.includes("olimpiyat") || 
         norm.includes("olympic") ||
         norm.includes("africa cup") ||
         norm.includes("asian cup");
}

export function isContinentalClubMatch(leagueName?: string | null): boolean {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  if (isNationalTeamMatch(leagueName)) return false;
  return norm.includes("champions league") || 
         norm.includes("şampiyonlar ligi") ||
         norm.includes("europa") || 
         norm.includes("avrupa ligi") ||
         norm.includes("conference") ||
         norm.includes("konferans") ||
         norm.includes("libertadores") || 
         norm.includes("sudamericana") ||
         norm.includes("afc champions") ||
         norm.includes("caf champions");
}

export function findSimilarMatches(
  query: SimilarityQuery,
  allMatches: HistoricalMatch[]
): SimilarMatchResult[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const qLig = query.league ? norm(query.league) : "";
  const qIsNational = isNationalTeamMatch(query.league);
  const qIsContinentalClub = isContinentalClubMatch(query.league);
  const qContinent = query.kita || getLeagueContinent(query.league);

  let targetCountrySynonyms: string[] = [];
  if (!qIsContinentalClub && !qIsNational) {
    for (const [key, synonyms] of Object.entries(countryMap)) {
      if (synonyms.some(syn => qLig.startsWith(syn) || qLig.includes(syn))) {
        targetCountrySynonyms = synonyms;
        break;
      }
    }
  }

  const isTargetMatchSameCountry = (mLigRawParam: string) => {
    if (targetCountrySynonyms.length > 0) {
      return targetCountrySynonyms.some(syn => {
        const regex = new RegExp(`\\b${syn}\\b`, 'i');
        return regex.test(mLigRawParam);
      });
    }
    const qLigRawNorm = (query.league || "").toLowerCase();
    const mLigRawNorm = mLigRawParam.toLowerCase();
    return qLigRawNorm === mLigRawNorm || qLigRawNorm.includes(mLigRawNorm) || mLigRawNorm.includes(qLigRawNorm);
  };

  // Pre-score all matches
  const scoredAll = allMatches.map(m => scoreMatch(query, m));

  const results: SimilarMatchResult[] = [];

  for (const item of scoredAll) {
    const mLigRaw = item.match.league || "";
    const mLig = norm(mLigRaw);
    const mIsNational = isNationalTeamMatch(mLigRaw);
    const mIsContinentalClub = isContinentalClubMatch(mLigRaw);
    const mContinent = getLeagueContinent(mLigRaw);
    const mIsFriendly = mLig.includes("hazirlik") || mLig.includes("friendly");
    const qIsFriendly = qLig.includes("hazirlik") || qLig.includes("friendly");

    let rawScore = item.similarityScore;
    let bonus = 0;

    // Yüksek öncelikli kurallar
    if (qIsFriendly !== mIsFriendly) {
        bonus -= 20.0;
    }
    
    if (qIsNational !== mIsNational) {
        bonus -= 15.0; 
    }

    // Bağlamsal Bonuslar / Penaltılar
    if (qIsContinentalClub) {
      if (mIsContinentalClub) {
        bonus += 2.0;
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 0.0;
      } else {
        bonus -= 5.0; 
      }
    } else if (qIsNational) {
      if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 3.0;
      } else {
        bonus -= 2.0;
      }
    } else {
      // Yerel Ligler
      if (isTargetMatchSameCountry(mLigRaw)) {
        bonus += 5.0; // Aynı ülke bonusu
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 1.5; // Aynı kıta bonusu
      } else {
        bonus -= 4.0; // Farklı kıta penaltısı
      }
    }
    
    item.similarityScore = Math.max(0.0, Math.min(100.0, rawScore + bonus));
    item.scoreBreakdown.rawScore = Math.round(rawScore * 10) / 10;
    item.scoreBreakdown.contextBonus = bonus;
    results.push(item);
  }

  // Tüm maçları sırala
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  const finalResults = query.strict100 ? results.filter(m => Math.round(m.similarityScore) === 100) : results.filter(m => m.similarityScore >= 0);
  const maxResults = query.strict100 ? Math.min(query.maxResults ?? 150, 150) : query.maxResults ?? 150;
  return finalResults.slice(0, maxResults);
}
