import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/scripts/backfillPredictions.ts
import Database2 from "better-sqlite3";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// src/lib/scraperDb.ts
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var DB_PATH = __require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
var _db = null;
function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}
function toHistoricalMatch(row, oddsType = "CLOSING") {
  const useOpening = oddsType === "OPENING";
  const o1 = useOpening ? row.oran_1_acilis : row.oran_1;
  const ox = useOpening ? row.oran_x_acilis : row.oran_x;
  const o2 = useOpening ? row.oran_2_acilis : row.oran_2;
  const alt = useOpening ? row.alt_orani_acilis : row.alt_orani;
  const ust = useOpening ? row.ust_orani_acilis : row.ust_orani;
  const kv = useOpening ? row.kg_var_acilis : row.kg_var;
  const ky = useOpening ? row.kg_yok_acilis : row.kg_yok;
  const alt35 = useOpening ? row.alt_orani_35_acilis : row.alt_orani_35;
  const ust35 = useOpening ? row.ust_orani_35_acilis : row.ust_orani_35;
  const iyAlt15 = useOpening ? row.iy_alt_orani_15_acilis : row.iy_alt_orani_15;
  const iyUst15 = useOpening ? row.iy_ust_orani_15_acilis : row.iy_ust_orani_15;
  const iyAlt05 = useOpening ? row.iy_alt_orani_05_acilis : row.iy_alt_orani_05;
  const iyUst05 = useOpening ? row.iy_ust_orani_05_acilis : row.iy_ust_orani_05;
  const cleanNum = (v) => v != null && v > 1.01 ? v : null;
  const cleanStr = (v) => v != null && v > 1.01 ? String(v) : null;
  const match = {
    id: row.id,
    matchDate: row.tarih ?? null,
    league: row.lig ?? "",
    homeTeam: row.ev_sahibi,
    awayTeam: row.deplasman,
    htScore: row.devre_skoru ?? null,
    ftScore: row.mac_skoru ?? "",
    previousScore: row.onceki_skorlar ?? null,
    yellowCardsHome: row.kart_ev ?? null,
    yellowCardsAway: row.kart_dep ?? null,
    redCards: row.kirmizi_kart ?? null,
    ligSirasiHome: row.lig_sira_ev ?? null,
    ligSirasiAway: row.lig_sira_dep ?? null,
    ligSirasiTotal: row.toplam_takim ?? null,
    oddsHome: cleanStr(o1) ?? "0",
    oddsDraw: cleanStr(ox) ?? "0",
    oddsAway: cleanStr(o2) ?? "0",
    altOdds: cleanStr(alt),
    ustOdds: cleanStr(ust),
    varOdds: cleanStr(kv),
    yokOdds: cleanStr(ky),
    altOdds35: cleanStr(alt35),
    ustOdds35: cleanStr(ust35),
    iyAltOdds15: cleanStr(iyAlt15),
    iyUstOdds15: cleanStr(iyUst15),
    iyAltOdds05: cleanStr(iyAlt05),
    iyUstOdds05: cleanStr(iyUst05),
    avgOddsMin: cleanStr(row.ort_min),
    avgOddsMax: cleanStr(row.ort_max),
    imResult: row.im_6 ?? null,
    kornerHome: row.korner_ev ?? null,
    kornerAway: row.korner_dep ?? null,
    kita: row.kita ?? null,
    ligSeviyesi: row.lig_seviyesi ?? null,
    teknikDirektorEv: row.teknik_direktor_ev ?? null,
    teknikDirektorDep: row.teknik_direktor_dep ?? null,
    hakem: row.hakem ?? null,
    stadyum: row.stadyum ?? null,
    createdAt: row.olusturma_tarihi ? new Date(row.olusturma_tarihi) : /* @__PURE__ */ new Date(),
    // Açılış ve kapanış oranlarını ayrı detay olarak ekle (ön yüz tooltip gösterimi vs. için)
    oran_1_acilis: cleanNum(row.oran_1_acilis ?? o1),
    oran_x_acilis: cleanNum(row.oran_x_acilis ?? ox),
    oran_2_acilis: cleanNum(row.oran_2_acilis ?? o2),
    alt_orani_acilis: cleanNum(row.alt_orani_acilis ?? alt),
    ust_orani_acilis: cleanNum(row.ust_orani_acilis ?? ust),
    kg_var_acilis: cleanNum(row.kg_var_acilis ?? kv),
    kg_yok_acilis: cleanNum(row.kg_yok_acilis ?? ky),
    alt_orani_35_acilis: cleanNum(row.alt_orani_35_acilis ?? alt35),
    ust_orani_35_acilis: cleanNum(row.ust_orani_35_acilis ?? ust35),
    iy_alt_orani_15_acilis: cleanNum(row.iy_alt_orani_15_acilis ?? iyAlt15),
    iy_ust_orani_15_acilis: cleanNum(row.iy_ust_orani_15_acilis ?? iyUst15),
    iy_alt_orani_05_acilis: cleanNum(row.iy_alt_orani_05_acilis ?? iyAlt05),
    iy_ust_orani_05_acilis: cleanNum(row.iy_ust_orani_05_acilis ?? iyUst05),
    oran_1_kapanis: cleanNum(row.oran_1),
    oran_x_kapanis: cleanNum(row.oran_x),
    oran_2_kapanis: cleanNum(row.oran_2),
    alt_orani_kapanis: cleanNum(row.alt_orani),
    ust_orani_kapanis: cleanNum(row.ust_orani),
    kg_var_kapanis: cleanNum(row.kg_var),
    kg_yok_kapanis: cleanNum(row.kg_yok),
    alt_orani_35_kapanis: cleanNum(row.alt_orani_35),
    ust_orani_35_kapanis: cleanNum(row.ust_orani_35),
    iy_alt_orani_15_kapanis: cleanNum(row.iy_alt_orani_15),
    iy_ust_orani_15_kapanis: cleanNum(row.iy_ust_orani_15),
    iy_alt_orani_05_kapanis: cleanNum(row.iy_alt_orani_05),
    iy_ust_orani_05_kapanis: cleanNum(row.iy_ust_orani_05)
  };
  return match;
}
function queryScraperMatches(oddsHome, oddsDraw, oddsAway, oddsType = "CLOSING", targetLeague, maxLimit = 15e3) {
  const db = getDb();
  if (!oddsHome || !oddsDraw || !oddsAway || oddsHome <= 1.01 || oddsDraw <= 1.01 || oddsAway <= 1.01) {
    const stmt2 = db.prepare(`
      SELECT *
      FROM gecmis_maclar
      WHERE mac_skoru IS NOT NULL
        AND mac_skoru != '?:?'
        AND mac_skoru != ''
        AND mac_skoru NOT LIKE '%?%'
        AND tarih IS NOT NULL
      ORDER BY id DESC
      LIMIT ${maxLimit}
    `);
    const rows2 = stmt2.all();
    return rows2.map((r) => toHistoricalMatch(r, oddsType));
  }
  const TOL_PROB = 0.08;
  const p1 = 1 / oddsHome;
  const px = 1 / oddsDraw;
  const p2 = 1 / oddsAway;
  const minHome = 1 / (p1 + TOL_PROB);
  const maxHome = 1 / Math.max(0.01, p1 - TOL_PROB);
  const minDraw = 1 / (px + TOL_PROB);
  const maxDraw = 1 / Math.max(0.01, px - TOL_PROB);
  const minAway = 1 / (p2 + TOL_PROB);
  const maxAway = 1 / Math.max(0.01, p2 - TOL_PROB);
  const hCol = oddsType === "OPENING" ? "oran_1_acilis" : "oran_1";
  const xCol = oddsType === "OPENING" ? "oran_x_acilis" : "oran_x";
  const aCol = oddsType === "OPENING" ? "oran_2_acilis" : "oran_2";
  const stmt = db.prepare(`
    SELECT *
    FROM gecmis_maclar
    WHERE ${hCol} > 1.01
      AND ${xCol} > 1.01
      AND ${aCol} > 1.01
      AND mac_skoru IS NOT NULL
      AND mac_skoru != '?:?'
      AND mac_skoru != ''
      AND mac_skoru NOT LIKE '%?%'
      AND tarih IS NOT NULL
      AND (
        CASE 
          WHEN tarih LIKE '%.%' AND LENGTH(tarih) >= 10 THEN 
            SUBSTR(tarih, 7, 4) || '-' || SUBSTR(tarih, 4, 2) || '-' || SUBSTR(tarih, 1, 2)
          WHEN tarih LIKE '%-%' AND LENGTH(tarih) >= 10 THEN 
            SUBSTR(tarih, 1, 10)
          ELSE NULL 
        END
      ) >= '2021-08-15'
      AND ${hCol} BETWEEN ? AND ?
      AND ${xCol} BETWEEN ? AND ?
      AND ${aCol} BETWEEN ? AND ?
    -- ORDER BY removed
    LIMIT ${maxLimit}
  `);
  const rows = stmt.all(
    minHome,
    maxHome,
    minDraw,
    maxDraw,
    minAway,
    maxAway
  );
  return rows.map((r) => toHistoricalMatch(r, oddsType));
}
function getLeagueGoalAverages(leagueName) {
  try {
    const db = getDb();
    const raw = (leagueName || "").trim();
    const cleanLeague = raw.replace(/-/g, " ").replace(/South Korea/gi, "G\xFCney Kore").replace(/Japan/gi, "Japonya").replace(/Brazil/gi, "Brezilya").replace(/Germany/gi, "Almanya").replace(/France/gi, "Fransa").replace(/Italy/gi, "\u0130talya").replace(/Spain/gi, "\u0130spanya").replace(/England/gi, "\u0130ngiltere").replace(/League/gi, "Lig").replace(/\s+/g, " ").trim();
    const likeLeague = `%${cleanLeague}%`;
    let row = db.prepare(`
      SELECT 
        AVG(CAST(SUBSTR(mac_skoru, 1, INSTR(mac_skoru, ':') - 1) AS REAL)) as avg_home,
        AVG(CAST(SUBSTR(mac_skoru, INSTR(mac_skoru, ':') + 1) AS REAL)) as avg_away
      FROM gecmis_maclar
      WHERE (lig = ? OR lig LIKE ? OR ? LIKE '%' || lig || '%')
        AND mac_skoru LIKE '%:%'
        AND mac_skoru NOT LIKE '%?%'
    `).get(cleanLeague, likeLeague, raw);
    if (row && row.avg_home !== null && row.avg_away !== null) {
      return {
        homePrior: Math.round(row.avg_home * 100) / 100,
        awayPrior: Math.round(row.avg_away * 100) / 100
      };
    }
  } catch (e) {
    console.error("getLeagueGoalAverages error:", e);
  }
  return { homePrior: 1.35, awayPrior: 1.15 };
}
function getTeamStandingsFallback(league, team) {
  try {
    const db = getDb();
    const stmt1 = db.prepare(`
      SELECT pos, total FROM (
        SELECT id, lig_sira_ev AS pos, toplam_takim AS total
        FROM gecmis_maclar
        WHERE (lig = ? OR lig LIKE ? OR ? LIKE '%' || lig || '%')
          AND ev_sahibi = ? 
          AND lig_sira_ev IS NOT NULL
        UNION ALL
        SELECT id, lig_sira_dep AS pos, toplam_takim AS total
        FROM gecmis_maclar
        WHERE (lig = ? OR lig LIKE ? OR ? LIKE '%' || lig || '%')
          AND deplasman = ? 
          AND lig_sira_dep IS NOT NULL
      )
      ORDER BY id DESC
      LIMIT 1
    `);
    const cleanLeague = league.trim();
    const likeLeague = `%${cleanLeague}%`;
    let row = stmt1.get(
      cleanLeague,
      likeLeague,
      cleanLeague,
      team,
      cleanLeague,
      likeLeague,
      cleanLeague,
      team
    );
    if (!row) {
      const stmt2 = db.prepare(`
        SELECT pos, total FROM (
          SELECT id, lig_sira_ev AS pos, toplam_takim AS total
          FROM gecmis_maclar
          WHERE ev_sahibi = ? AND lig_sira_ev IS NOT NULL
          UNION ALL
          SELECT id, lig_sira_dep AS pos, toplam_takim AS total
          FROM gecmis_maclar
          WHERE deplasman = ? AND lig_sira_dep IS NOT NULL
        )
        ORDER BY id DESC
        LIMIT 1
      `);
      row = stmt2.get(team, team);
    }
    if (row) {
      return { position: row.pos, totalTeams: row.total };
    }
  } catch (e) {
    console.error("getTeamStandingsFallback error:", e);
  }
  return null;
}

// src/lib/similarity.ts
var W_ODDS = 60;
var W_LEAGUE = 20;
var W_CARD = 20;
var MAIN_PROB_TOL = 0.08;
var ALT_PROB_TOL = 0.06;
var CARD_TOL = 1.5;
var LIG_DIFF_WINDOW = 3;
function oddsScore(target, actual, probTolerance) {
  if (actual == null || target <= 1) return 0;
  const a = typeof actual === "string" ? parseFloat(actual) : actual;
  if (isNaN(a) || a <= 1) return 0;
  const targetProb = 1 / target;
  const actualProb = 1 / a;
  const diff = Math.abs(targetProb - actualProb);
  if (diff <= probTolerance) {
    return 0.5 + 0.5 * (1 - diff / probTolerance);
  }
  if (diff <= probTolerance * 2) {
    return 0.5 * (1 - (diff - probTolerance) / probTolerance);
  }
  return 0;
}
function scoreMatch(query, match) {
  const mHome = oddsScore(query.oddsHome, match.oddsHome, MAIN_PROB_TOL);
  const mDraw = oddsScore(query.oddsDraw, match.oddsDraw, MAIN_PROB_TOL);
  const mAway = oddsScore(query.oddsAway, match.oddsAway, MAIN_PROB_TOL);
  let oddsRaw = (mHome + mDraw + mAway) / 3;
  let auxCount = 0;
  let auxSum = 0;
  if (query.altOdds != null) {
    auxSum += oddsScore(query.altOdds, match.altOdds, ALT_PROB_TOL);
    auxCount++;
  }
  if (query.ustOdds != null) {
    auxSum += oddsScore(query.ustOdds, match.ustOdds, ALT_PROB_TOL);
    auxCount++;
  }
  if (query.varOdds != null) {
    auxSum += oddsScore(query.varOdds, match.varOdds, ALT_PROB_TOL);
    auxCount++;
  }
  if (query.yokOdds != null) {
    auxSum += oddsScore(query.yokOdds, match.yokOdds, ALT_PROB_TOL);
    auxCount++;
  }
  if (auxCount > 0) {
    const auxRaw = auxSum / auxCount;
    oddsRaw = oddsRaw * 0.6 + auxRaw * 0.4;
  }
  const oddsScore_ = Math.round(oddsRaw * W_ODDS * 10) / 10;
  let leagueScore = 0;
  if (query.league && match.league && query.league.trim().toLowerCase() === match.league.trim().toLowerCase()) {
    leagueScore += 10;
  } else if (query.league && match.league) {
    const qParts = query.league.toLowerCase().split(" ");
    const mParts = match.league.toLowerCase().split(" ");
    if (qParts[0] === mParts[0]) leagueScore += 4;
  }
  if (query.ligSirasiDiff != null && match.ligSirasiHome != null && match.ligSirasiAway != null) {
    const matchDiff = Math.abs(match.ligSirasiHome - match.ligSirasiAway);
    const diff = Math.abs(query.ligSirasiDiff - matchDiff);
    if (diff <= LIG_DIFF_WINDOW) {
      leagueScore += 10 * (1 - diff / LIG_DIFF_WINDOW);
    } else if (diff <= LIG_DIFF_WINDOW * 2) {
      leagueScore += 5 * (1 - (diff - LIG_DIFF_WINDOW) / (LIG_DIFF_WINDOW * 2));
    }
  } else {
    leagueScore += 5;
  }
  leagueScore = Math.min(Math.round(leagueScore * 10) / 10, W_LEAGUE);
  let cardScore = 0;
  if (query.avgCardsTotal != null && match.yellowCardsHome != null && match.yellowCardsAway != null) {
    const matchCards = (match.yellowCardsHome ?? 0) + (match.yellowCardsAway ?? 0) + (match.redCards ?? 0);
    const diff = Math.abs(query.avgCardsTotal - matchCards);
    if (diff <= CARD_TOL) {
      cardScore = W_CARD * (1 - diff / CARD_TOL);
    } else if (diff <= CARD_TOL * 2) {
      cardScore = W_CARD / 2 * (1 - (diff - CARD_TOL) / (CARD_TOL * 2));
    }
  } else {
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
      cardScore
    }
  };
}
var countryMap = {
  "turkiye": ["turkey", "turkiye", "turkish", "s\xFCper lig", "tff", "1. lig"],
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
function getLeagueContinent(leagueName) {
  if (!leagueName) return "UNKNOWN";
  const norm = leagueName.toLowerCase();
  if (norm.includes("uefa") || norm.includes("champions league") || norm.includes("europa") || norm.includes("euro")) return "EUROPE";
  if (norm.includes("libertadores") || norm.includes("sudamericana") || norm.includes("copa america")) return "SOUTH_AMERICA";
  if (norm.includes("afc") || norm.includes("asian")) return "ASIA";
  if (norm.includes("caf") || norm.includes("african")) return "AFRICA";
  if (norm.includes("concacaf") || norm.includes("gold cup")) return "NORTH_AMERICA";
  if (norm.includes("world cup") || norm.includes("fifa")) return "WORLD";
  const europe = ["ingiltere", "almanya", "italya", "ispanya", "fransa", "turkiye", "hollanda", "portekiz", "belcika", "iskocya", "yunanistan", "rusya", "ukrayna", "isvicre", "avusturya", "isvec", "norvec", "danimarka", "polonya", "romanya", "sirbistan", "hirvatistan", "cek", "macaristan", "irlanda", "galler", "finlandiya", "izlanda", "slovakya", "slovenya", "bulgaristan", "bosna", "karadag", "makedonya", "kosova", "arnavutluk", "kibris", "gurcistan", "ermenistan", "azerbaycan", "kazakistan", "estonya", "letonya", "litvanya", "belarus", "galler", "kuzey irlanda"];
  const south_america = ["brezilya", "arjantin", "kolombiya", "sili", "peru", "uruguay", "ekvador", "paraguay", "bolivya", "venezuela"];
  const north_america = ["abd", "meksika", "kanada", "kosta rika", "honduras", "panama", "jamaika", "el salvador", "guatemala"];
  const asia = ["japonya", "guney kore", "cin", "avustralya", "iran", "suudi arabistan", "bae", "katar", "ozbekistan", "irak", "umman", "suriye", "urdun", "bahreyn", "kuveyt", "yemen", "lbnan", "filistin", "hindistan", "tayland", "vietnam", "malezya", "endonezya", "singapur"];
  const africa = ["misir", "fas", "cezayir", "tunus", "senegal", "nijerya", "kamerun", "fildisi", "gana", "mali", "guney afrika", "zambiya", "uganda", "kenya"];
  if (europe.some((c) => norm.includes(c))) return "EUROPE";
  if (south_america.some((c) => norm.includes(c))) return "SOUTH_AMERICA";
  if (north_america.some((c) => norm.includes(c))) return "NORTH_AMERICA";
  if (asia.some((c) => norm.includes(c))) return "ASIA";
  if (africa.some((c) => norm.includes(c))) return "AFRICA";
  return "UNKNOWN";
}
function isNationalTeamMatch(leagueName) {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  return norm.includes("world cup") || norm.includes("d\xFCnya kupas\u0131") || norm.includes("nations league") || norm.includes("euro ") || norm.includes("avrupa \u015Fampiyonas\u0131") || norm.includes("copa america") || norm.includes("olimpiyat") || norm.includes("olympic") || norm.includes("africa cup") || norm.includes("asian cup");
}
function isContinentalClubMatch(leagueName) {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  if (isNationalTeamMatch(leagueName)) return false;
  return norm.includes("champions league") || norm.includes("\u015Fampiyonlar ligi") || norm.includes("europa") || norm.includes("avrupa ligi") || norm.includes("conference") || norm.includes("konferans") || norm.includes("libertadores") || norm.includes("sudamericana") || norm.includes("afc champions") || norm.includes("caf champions");
}
function findSimilarMatches(query, allMatches) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const qLig = query.league ? norm(query.league) : "";
  const qIsNational = isNationalTeamMatch(query.league);
  const qIsContinentalClub = isContinentalClubMatch(query.league);
  const qContinent = query.kita || getLeagueContinent(query.league);
  let targetCountrySynonyms = [];
  if (!qIsContinentalClub && !qIsNational) {
    for (const [key, synonyms] of Object.entries(countryMap)) {
      if (synonyms.some((syn) => qLig.startsWith(syn) || qLig.includes(syn))) {
        targetCountrySynonyms = synonyms;
        break;
      }
    }
  }
  const isTargetMatchSameCountry = (mLigRawParam) => {
    if (targetCountrySynonyms.length > 0) {
      return targetCountrySynonyms.some((syn) => {
        const regex = new RegExp(`\\b${syn}\\b`, "i");
        return regex.test(mLigRawParam);
      });
    }
    const qLigRawNorm = (query.league || "").toLowerCase();
    const mLigRawNorm = mLigRawParam.toLowerCase();
    return qLigRawNorm === mLigRawNorm || qLigRawNorm.includes(mLigRawNorm) || mLigRawNorm.includes(qLigRawNorm);
  };
  const scoredAll = allMatches.map((m) => scoreMatch(query, m));
  const results = [];
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
    if (qIsFriendly !== mIsFriendly) {
      bonus -= 20;
    }
    if (qIsNational !== mIsNational) {
      bonus -= 15;
    }
    if (qIsContinentalClub) {
      if (mIsContinentalClub) {
        bonus += 2;
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 0;
      } else {
        bonus -= 5;
      }
    } else if (qIsNational) {
      if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 3;
      } else {
        bonus -= 2;
      }
    } else {
      if (isTargetMatchSameCountry(mLigRaw)) {
        bonus += 5;
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 1.5;
      } else {
        bonus -= 4;
      }
    }
    item.similarityScore = Math.max(0, Math.min(100, rawScore + bonus));
    item.scoreBreakdown.rawScore = Math.round(rawScore * 10) / 10;
    item.scoreBreakdown.contextBonus = bonus;
    results.push(item);
  }
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  const finalResults = query.strict100 ? results.filter((m) => Math.round(m.similarityScore) === 100) : results.filter((m) => m.similarityScore >= 0);
  const maxResults = query.strict100 ? Math.min(query.maxResults ?? 150, 150) : query.maxResults ?? 150;
  return finalResults.slice(0, maxResults);
}

// src/lib/analyzeEngine.ts
function parseScore(s) {
  if (!s) return null;
  const clean = s.trim().replace(/\?/g, "").replace(/\s/g, "");
  const m = clean.match(/^(\d+)[:\-](\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1], 10), away: parseInt(m[2], 10) };
}
function resultType(s) {
  const p = parseScore(s);
  if (!p) return null;
  if (p.home > p.away) return "ev";
  if (p.home < p.away) return "dep";
  return "ber";
}
function scoreClass(s) {
  const r = resultType(s);
  if (r === "ev") return "score-home";
  if (r === "dep") return "score-away";
  if (r === "ber") return "score-draw";
  return null;
}
function rowClass(s) {
  const r = resultType(s);
  if (r === "ev") return "row-home";
  if (r === "dep") return "row-away";
  if (r === "ber") return "row-draw";
  return "";
}
function fmtOdds(v) {
  if (v == null) return null;
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num) || num <= 1) return null;
  return num.toFixed(2).replace(".", ",");
}
function fmtCard(v, pad = true) {
  if (v == null) return "00";
  return pad ? String(v).padStart(2, "0") : String(v);
}
function parseDate(s) {
  if (!s) return null;
  const clean = s.trim();
  let m = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (m) {
    return new Date(
      parseInt(m[1], 10),
      parseInt(m[2], 10) - 1,
      parseInt(m[3], 10)
    );
  }
  m = clean.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    return new Date(
      parseInt(m[3], 10),
      parseInt(m[2], 10) - 1,
      parseInt(m[1], 10)
    );
  }
  return null;
}
function imRenk(im) {
  if (!im) return "";
  if (im === "2/1") return "im-special";
  if (im === "1/1") return "im-good";
  return "";
}
function calcOrtalamaString(item) {
  if (item.avgOddsMin != null && item.avgOddsMax != null) {
    return `${fmtOdds(item.avgOddsMin)}-${fmtOdds(item.avgOddsMax)}`;
  }
  const odds = [];
  const oH = item.oddsHome ?? item.oran_1;
  const oD = item.oddsDraw ?? item.oran_x;
  const oA = item.oddsAway ?? item.oran_2;
  const oAlt = item.altOdds ?? item.alt_orani;
  const oUst = item.ustOdds ?? item.ust_orani;
  if (oH != null && oH > 1) odds.push(oH);
  if (oD != null && oD > 1) odds.push(oD);
  if (oA != null && oA > 1) odds.push(oA);
  if (oAlt != null && oAlt > 1) odds.push(oAlt);
  if (oUst != null && oUst > 1) odds.push(oUst);
  if (odds.length >= 2) {
    const minO = Math.min(...odds);
    const maxO = Math.max(...odds);
    return `${fmtOdds(minO)}-${fmtOdds(maxO)}`;
  }
  return "";
}
function factorial(n) {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}
function poissonProb(k, lambda) {
  return Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
}
function analyze(targetMatch, referenceMatches, config) {
  const consensusWeightSim = config?.consensusWeightSimilarity ?? 0.6;
  const consensusWeightPoisson = 1 - consensusWeightSim;
  let M = config?.betaBinomialM ?? 4;
  const decayScale = config?.timeDecayScale ?? 540;
  const total = referenceMatches.length;
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
  const htFreq = {};
  const ftFreq = {};
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
  const simScores = [];
  let sumWSquared = 0;
  for (const m of referenceMatches) {
    const targetD = parseDate(targetMatch.date);
    const refD = parseDate(m.matchDate);
    let decay = 1;
    if (targetD && refD) {
      const daysDiff = Math.abs(
        (targetD.getTime() - refD.getTime()) / (1e3 * 60 * 60 * 24)
      );
      decay = Math.exp(-daysDiff / decayScale);
    }
    const sim = m.similarityScore ?? 100;
    simScores.push(sim);
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
    if (goals > 4.5) {
      over45Count++;
    }
    if (goals >= 6) {
      gol6PlusCount++;
    }
    const htxx = parseScore(m.htScore);
    if (htxx && ft) {
      if (htxx.home > htxx.away && ft.home < ft.away) iyMs1_2Count++;
      if (htxx.home < htxx.away && ft.home > ft.away) iyMs2_1Count++;
    }
    const ftKey = `${ft.home}:${ft.away}`;
    ftFreq[ftKey] = (ftFreq[ftKey] ?? 0) + 1;
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
    if (m.yellowCardsHome != null || m.yellowCardsAway != null) {
      totalCards += (m.yellowCardsHome ?? 0) + (m.yellowCardsAway ?? 0) + (m.redCards ?? 0);
      cardCount++;
    }
    if (m.kornerHome != null || m.kornerAway != null) {
      const mk = (m.kornerHome ?? 0) + (m.kornerAway ?? 0);
      totalKorner += mk;
      kornerCount++;
      if (mk >= 10) ust10CornerCount++;
    }
  }
  const effectiveSampleSize = sumWSquared > 0 ? Math.round(simSum * simSum / sumWSquared * 10) / 10 : 0;
  let priorHome = 0.35;
  let priorDraw = 0.3;
  let priorAway = 0.35;
  if (targetMatch.oddsHome && targetMatch.oddsDraw && targetMatch.oddsAway) {
    const oH = targetMatch.oddsHome;
    const oD = targetMatch.oddsDraw;
    const oA = targetMatch.oddsAway;
    const piH = 1 / oH;
    const piD = 1 / oD;
    const piA = 1 / oA;
    const S = piH + piD + piA;
    const z = Math.max(0, (S - 1) / 2);
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
    if (targetMatch.oddsHome) priorHome = 1 / targetMatch.oddsHome;
    if (targetMatch.oddsDraw) priorDraw = 1 / targetMatch.oddsDraw;
    if (targetMatch.oddsAway) priorAway = 1 / targetMatch.oddsAway;
    const s = priorHome + priorDraw + priorAway;
    if (s > 0) {
      priorHome /= s;
      priorDraw /= s;
      priorAway /= s;
    }
  }
  let priorOver = 0.48;
  if (targetMatch.ustOdds && targetMatch.altOdds) {
    const sumOU = 1 / targetMatch.ustOdds + 1 / targetMatch.altOdds;
    priorOver = 1 / targetMatch.ustOdds / sumOU;
  } else if (targetMatch.ustOdds) {
    priorOver = 1 / targetMatch.ustOdds / 1.065;
  }
  const priorBtts = targetMatch.varOdds && targetMatch.yokOdds ? 1 / targetMatch.varOdds / (1 / targetMatch.varOdds + 1 / targetMatch.yokOdds) : targetMatch.varOdds ? 1 / targetMatch.varOdds / 1.065 : 0.52;
  const priorOver35 = targetMatch.ustOdds35 && targetMatch.altOdds35 ? 1 / targetMatch.ustOdds35 / (1 / targetMatch.ustOdds35 + 1 / targetMatch.altOdds35) : targetMatch.ustOdds35 ? 1 / targetMatch.ustOdds35 / 1.065 : 0.25;
  const priorIyOver15 = targetMatch.iyUstOdds15 && targetMatch.iyAltOdds15 ? 1 / targetMatch.iyUstOdds15 / (1 / targetMatch.iyUstOdds15 + 1 / targetMatch.iyAltOdds15) : targetMatch.iyUstOdds15 ? 1 / targetMatch.iyUstOdds15 / 1.065 : 0.32;
  const priorIyOver05 = targetMatch.iyUstOdds05 && targetMatch.iyAltOdds05 ? 1 / targetMatch.iyUstOdds05 / (1 / targetMatch.iyUstOdds05 + 1 / targetMatch.iyAltOdds05) : targetMatch.iyUstOdds05 ? 1 / targetMatch.iyUstOdds05 / 1.065 : 0.7;
  const priorCorner = 0.5;
  const avgSim = simScores.length > 0 ? simScores.reduce((a, b) => a + b, 0) / simScores.length : 0;
  M = config?.betaBinomialM ?? (effectiveSampleSize > 0 ? 8 / Math.sqrt(effectiveSampleSize) : 4);
  const M_ht = htValidCount > 0 ? 8 / Math.sqrt(htValidCount) : M;
  const M_corner = kornerCount > 0 ? 8 / Math.sqrt(kornerCount) : M;
  const pHamHome = total > 0 && simSum > 0 ? homeWinsWeighted / simSum : priorHome;
  const pHamDraw = total > 0 && simSum > 0 ? drawsWeighted / simSum : priorDraw;
  const pHamAway = total > 0 && simSum > 0 ? awayWinsWeighted / simSum : priorAway;
  let pFinalHome = total > 0 ? (total * pHamHome + M * priorHome) / (total + M) : priorHome;
  let pFinalDraw = total > 0 ? (total * pHamDraw + M * priorDraw) / (total + M) : priorDraw;
  let pFinalAway = total > 0 ? (total * pHamAway + M * priorAway) / (total + M) : priorAway;
  const sumFinalSides = pFinalHome + pFinalDraw + pFinalAway;
  if (sumFinalSides > 0) {
    pFinalHome /= sumFinalSides;
    pFinalDraw /= sumFinalSides;
    pFinalAway /= sumFinalSides;
  }
  const homePctWeighted = Math.round(pFinalHome * 100);
  const drawPctWeighted = Math.round(pFinalDraw * 100);
  const awayPctWeighted = 100 - homePctWeighted - drawPctWeighted;
  const leagueGoalAverages = getLeagueGoalAverages(targetMatch.league || "");
  const targetLeagueAvgGoals = leagueGoalAverages.homePrior + leagueGoalAverages.awayPrior;
  const globalRefAvgGoals = 2.75;
  const leagueGoalFactor = Math.min(
    1.25,
    Math.max(0.75, targetLeagueAvgGoals / globalRefAvgGoals)
  );
  const pHamBtts = total > 0 && simSum > 0 ? bttsWeighted / simSum : priorBtts;
  let pFinalBtts = total > 0 ? (total * pHamBtts + M * priorBtts) / (total + M) : priorBtts;
  pFinalBtts = Math.min(0.95, Math.max(0.05, pFinalBtts * leagueGoalFactor));
  const bttsPctWeighted = Math.round(pFinalBtts * 100);
  const pHamOver25 = total > 0 && simSum > 0 ? over25Weighted / simSum : priorOver;
  let pFinalOver25 = total > 0 ? (total * pHamOver25 + M * priorOver) / (total + M) : priorOver;
  pFinalOver25 = Math.min(
    0.95,
    Math.max(0.05, pFinalOver25 * leagueGoalFactor)
  );
  const over25PctWeighted = Math.round(pFinalOver25 * 100);
  const pHamOver35 = total > 0 && simSum > 0 ? over35Weighted / simSum : priorOver35;
  const pFinalOver35 = total > 0 ? (total * pHamOver35 + M * priorOver35) / (total + M) : priorOver35;
  const over35PctWeighted = Math.round(pFinalOver35 * 100);
  const pHamIyOver15 = htValidCount > 0 && htSimSum > 0 ? iyOver15Weighted / htSimSum : priorIyOver15;
  const pFinalIyOver15 = htValidCount > 0 ? (htValidCount * pHamIyOver15 + M_ht * priorIyOver15) / (htValidCount + M_ht) : priorIyOver15;
  const iyOver15PctWeighted = Math.round(pFinalIyOver15 * 100);
  const pHamIyOver05 = htValidCount > 0 && htSimSum > 0 ? iyOver05Weighted / htSimSum : priorIyOver05;
  const pFinalIyOver05 = htValidCount > 0 ? (htValidCount * pHamIyOver05 + M_ht * priorIyOver05) / (htValidCount + M_ht) : priorIyOver05;
  const iyOver05PctWeighted = Math.round(pFinalIyOver05 * 100);
  let cornerWeighted = 0;
  let cornerSimSum = 0;
  for (let i = 0; i < referenceMatches.length; i++) {
    const m = referenceMatches[i];
    if (m.kornerHome != null || m.kornerAway != null) {
      const targetD = parseDate(targetMatch.date);
      const refD = parseDate(m.matchDate);
      let decay = 1;
      if (targetD && refD) {
        const daysDiff = Math.abs(
          (targetD.getTime() - refD.getTime()) / (1e3 * 60 * 60 * 24)
        );
        decay = Math.exp(-daysDiff / 540);
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
  const pHamCorner = kornerCount > 0 && cornerSimSum > 0 ? cornerWeighted / cornerSimSum : priorCorner;
  const pFinalCorner = kornerCount > 0 ? (kornerCount * pHamCorner + M_corner * priorCorner) / (kornerCount + M_corner) : priorCorner;
  const cornerPctWeighted = Math.round(pFinalCorner * 100);
  const guvenSkoru = Math.round(total * avgSim / 100 * 10) / 10;
  let guvenSeviyesi = "DUSUK";
  if (guvenSkoru >= 40) {
    guvenSeviyesi = "YUKSEK";
  } else if (guvenSkoru >= 15) {
    guvenSeviyesi = "ORTA";
  }
  const leagueName = targetMatch.league || "";
  const { homePrior, awayPrior } = getLeagueGoalAverages(leagueName);
  let lambdaHome = homePrior;
  let lambdaAway = awayPrior;
  if (validGoalsMatches > 0) {
    const rawLambdaHome = totalHomeGoalsRef / validGoalsMatches;
    const rawLambdaAway = totalAwayGoalsRef / validGoalsMatches;
    const C_GOALS = 4;
    const K_GOALS = validGoalsMatches / (validGoalsMatches + C_GOALS);
    lambdaHome = K_GOALS * rawLambdaHome + (1 - K_GOALS) * homePrior;
    lambdaAway = K_GOALS * rawLambdaAway + (1 - K_GOALS) * awayPrior;
  }
  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;
  let pOver25 = 0;
  let pOver35 = 0;
  let pBtts = 0;
  let sumP = 0;
  const rho = -0.13;
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      let pScore = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
      let tau = 1;
      if (h === 0 && a === 0) tau = 1 - lambdaHome * lambdaAway * rho;
      else if (h === 1 && a === 0) tau = 1 + lambdaAway * rho;
      else if (h === 0 && a === 1) tau = 1 + lambdaHome * rho;
      else if (h === 1 && a === 1) tau = 1 - rho;
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
  let rawHomePct = total > 0 ? consensusWeightSim * homePctWeighted + consensusWeightPoisson * pHomeWin * 100 : priorHome * 100;
  let rawDrawPct = total > 0 ? consensusWeightSim * drawPctWeighted + consensusWeightPoisson * pDraw * 100 : priorDraw * 100;
  let rawAwayPct = total > 0 ? consensusWeightSim * awayPctWeighted + consensusWeightPoisson * pAwayWin * 100 : priorAway * 100;
  const sumSides = rawHomePct + rawDrawPct + rawAwayPct;
  const finalHomePct = sumSides > 0 ? Math.round(rawHomePct / sumSides * 100) : Math.round(priorHome * 100);
  const finalDrawPct = sumSides > 0 ? Math.round(rawDrawPct / sumSides * 100) : Math.round(priorDraw * 100);
  const finalAwayPct = 100 - finalHomePct - finalDrawPct;
  const finalBttsPct = total > 0 ? Math.round(
    consensusWeightSim * bttsPctWeighted + consensusWeightPoisson * pBtts * 100
  ) : Math.round(priorBtts * 100);
  const finalOver25Pct = total > 0 ? Math.round(
    consensusWeightSim * over25PctWeighted + consensusWeightPoisson * pOver25 * 100
  ) : Math.round(priorOver * 100);
  const finalOver35Pct = total > 0 ? Math.round(
    consensusWeightSim * over35PctWeighted + consensusWeightPoisson * pOver35 * 100
  ) : Math.round(priorOver35 * 100);
  const finalIyOver15Pct = total > 0 ? Math.round(
    consensusWeightSim * iyOver15PctWeighted + consensusWeightPoisson * pIyOver15 * 100
  ) : Math.round(priorIyOver15 * 100);
  const finalIyOver05Pct = total > 0 ? Math.round(
    consensusWeightSim * iyOver05PctWeighted + consensusWeightPoisson * pIyOver05 * 100
  ) : Math.round(priorIyOver05 * 100);
  let kellyHome = {
    oran: targetMatch.oddsHome ?? 0,
    kasa_yuzdesi: 0,
    edge: 0,
    tavsiye: "Bahis Yapma (De\u011Fersiz Oran)"
  };
  let kellyDraw = {
    oran: targetMatch.oddsDraw ?? 0,
    kasa_yuzdesi: 0,
    edge: 0,
    tavsiye: "Bahis Yapma (De\u011Fersiz Oran)"
  };
  let kellyAway = {
    oran: targetMatch.oddsAway ?? 0,
    kasa_yuzdesi: 0,
    edge: 0,
    tavsiye: "Bahis Yapma (De\u011Fersiz Oran)"
  };
  const calcKelly = (prob, odds) => {
    const o = odds ?? 0;
    if (o <= 1)
      return {
        oran: o,
        kasa_yuzdesi: 0,
        edge: 0,
        tavsiye: "D\uFFFDKKAT: Model edge piyasay\uFFFD yenememektedir, bahis tavsiye edilmez."
      };
    const edge = prob - 1 / o;
    return {
      oran: o,
      kasa_yuzdesi: 0,
      edge: Math.round(edge * 1e3) / 10,
      tavsiye: "D\uFFFDKKAT: Model edge piyasay\uFFFD yenememektedir, bahis tavsiye edilmez."
    };
  };
  kellyHome = calcKelly(finalHomePct / 100, targetMatch.oddsHome);
  kellyDraw = calcKelly(finalDrawPct / 100, targetMatch.oddsDraw);
  kellyAway = calcKelly(finalAwayPct / 100, targetMatch.oddsAway);
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
      totalReturn -= 1;
      continue;
    }
    if (o1 < o2) {
      if (ft.home > ft.away) totalReturn += o1 - 1;
      else totalReturn -= 1;
    } else {
      if (ft.away > ft.home) totalReturn += o2 - 1;
      else totalReturn -= 1;
    }
  }
  const modelRoi = betCount > 0 ? Math.round(totalReturn / betCount * 100 * 10) / 10 : 0;
  let predictability = "ORTA";
  if (betCount >= 5) {
    if (modelRoi > 5) predictability = "YUKSEK";
    else if (modelRoi < -5) predictability = "DUSUK";
  }
  const analiz_yuzde_str = total > 0 ? `${finalHomePct}-${finalDrawPct}-${finalAwayPct}` : "0-0-0";
  const ortKorner = kornerCount > 0 ? Math.round(totalKorner / kornerCount * 10) / 10 : null;
  const bttsPct = finalBttsPct;
  const over25Pct = finalOver25Pct;
  const avgCards = cardCount > 0 ? totalCards / cardCount : 0;
  const getCommonFreqShrinkage = (freq, baselineProb) => {
    const entries = Object.entries(freq);
    if (!entries.length) return null;
    entries.sort((a, b) => {
      const pctA = (a[1] + M * baselineProb) / (total + M);
      const pctB = (b[1] + M * baselineProb) / (total + M);
      return pctB - pctA;
    });
    return entries[0][0];
  };
  const sikMs = getCommonFreqShrinkage(ftFreq, 0.1);
  const sikIy = getCommonFreqShrinkage(htFreq, 0.15);
  const statGroupWeighted = (count, total2, weightedPct, label) => {
    return {
      sayi: count,
      yuzde: weightedPct,
      label: `${label} ${count}/${total2} (${weightedPct}%)`
    };
  };
  const calcSD = (pct, n) => {
    if (n <= 0) return 0;
    const p = pct / 100;
    const se = Math.sqrt(p * (1 - p) / n);
    return Math.round(se * 1.96 * 100);
  };
  const sdHome = calcSD(finalHomePct, total);
  const sdDraw = calcSD(finalDrawPct, total);
  const sdAway = calcSD(finalAwayPct, total);
  const sdBtts = calcSD(finalBttsPct, total);
  const sdOver25 = calcSD(finalOver25Pct, total);
  const kalibrasyon_skoru = Math.min(
    100,
    Math.round(Math.max(0, guvenSkoru * 1.2 + 30))
  );
  const lig_dagilimi = {};
  for (const m of referenceMatches) {
    const lig = m.league || "Bilinmiyor";
    lig_dagilimi[lig] = (lig_dagilimi[lig] || 0) + 1;
  }
  const analiz_ozet = {
    total_mac: total,
    effective_sample_size: effectiveSampleSize,
    lig_dagilimi,
    ev_sahibi: {
      sayi: homeWins,
      yuzde: finalHomePct,
      sapma: sdHome,
      label: `Ev Sahibi (MS1) %${finalHomePct}`
    },
    beraberlik: {
      sayi: draws,
      yuzde: finalDrawPct,
      sapma: sdDraw,
      label: `Beraberlik (MS0) %${finalDrawPct}`
    },
    deplasman: {
      sayi: awayWins,
      yuzde: finalAwayPct,
      sapma: sdAway,
      label: `Deplasman (MS2) %${finalAwayPct}`
    },
    kg_var: {
      sayi: bttsCount,
      yuzde: finalBttsPct,
      sapma: sdBtts,
      label: `Kar\u015F\u0131l\u0131kl\u0131 Gol Var %${finalBttsPct}`
    },
    ust_25: {
      sayi: over25Count,
      yuzde: finalOver25Pct,
      sapma: sdOver25,
      label: `2.5 \xDCst %${finalOver25Pct}`
    },
    ust_35: statGroupWeighted(over35Count, total, finalOver35Pct, "3.5 \xDCst"),
    ust_45: statGroupWeighted(
      over45Count,
      total,
      Math.round(over45Count / Math.max(simSum, 1e-3) * 100),
      "4.5 \xDCst"
    ),
    gol_6_plus: statGroupWeighted(
      gol6PlusCount,
      total,
      Number((gol6PlusCount / Math.max(simSum, 1e-3) * 100).toFixed(1)),
      "6+ Gol"
    ),
    iy_ms_1_2: statGroupWeighted(
      iyMs1_2Count,
      total,
      Number((iyMs1_2Count / Math.max(simSum, 1e-3) * 100).toFixed(1)),
      "1/2"
    ),
    iy_ms_2_1: statGroupWeighted(
      iyMs2_1Count,
      total,
      Number((iyMs2_1Count / Math.max(simSum, 1e-3) * 100).toFixed(1)),
      "2/1"
    ),
    iy_ust_15: statGroupWeighted(
      iyOver15Count,
      htValidCount > 0 ? htValidCount : 1,
      finalIyOver15Pct,
      "\u0130Y 1.5 \xDCst"
    ),
    iy_ust_05: statGroupWeighted(
      iyOver05Count,
      htValidCount > 0 ? htValidCount : 1,
      finalIyOver05Pct,
      "\u0130Y 0.5 \xDCst"
    ),
    ort_kart: Math.round(avgCards * 10) / 10,
    ort_korner: ortKorner,
    ust_10_korner: statGroupWeighted(
      ust10CornerCount,
      kornerCount > 0 ? kornerCount : 1,
      cornerPctWeighted,
      "10+ Korner"
    ),
    sik_ms: sikMs,
    sik_iy: sikIy,
    guvenlik_skoru: avgSim,
    kelly_onerileri: {
      ev_sahibi: kellyHome,
      beraberlik: kellyDraw,
      deplasman: kellyAway
    }
  };
  const tahminler = [];
  if (total < 5 || effectiveSampleSize < 5) {
    tahminler.push("Zay\u0131f G\xFCven (Yetersiz Referans Ma\xE7)");
  } else {
    const homePct = analiz_ozet.ev_sahibi.yuzde;
    const drawPct = analiz_ozet.beraberlik.yuzde;
    const awayPct = analiz_ozet.deplasman.yuzde;
    const isHighSim = avgSim >= 85;
    const edgeHome = kellyHome.edge;
    const edgeAway = kellyAway.edge;
    const hasOdds1 = (targetMatch.oddsHome ?? 0) > 1;
    const hasOdds2 = (targetMatch.oddsAway ?? 0) > 1;
    let t1 = "";
    if (homePct >= 75) t1 = "DA | 1";
    if (t1) tahminler.push(t1);
    let t2 = "";
    if (awayPct >= 75) t2 = "DA | 2";
    if (t2) tahminler.push(t2);
    if (drawPct >= 40) tahminler.push("DA | X");
    if (bttsPct >= 75) tahminler.push("MS | KG VAR");
    else if (bttsPct <= 25) tahminler.push("MS | KG YOK");
    if (over25Pct >= 75) tahminler.push("MS | 2,5 \uFFFDST");
    else if (over25Pct <= 25) tahminler.push("MS | 2,5 ALT");
    if (sikIy) {
      const freq = htFreq[sikIy] ?? 0;
      if (freq / total * 100 >= 60) {
        tahminler.push("\u0130Y | " + sikIy + " Skor");
      }
    }
  }
  const tablo_satirlari = [];
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
  const getTrend = (acilis, kapanis) => {
    const a = parseFloat(acilis);
    const k = parseFloat(kapanis);
    if (isNaN(a) || isNaN(k) || a <= 0 || k <= 0) return null;
    if (k < a - 0.01) return "down";
    if (k > a + 0.01) return "up";
    return "flat";
  };
  tablo_satirlari.push({
    id: "target",
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
    row_renk: "row-target",
    takimlar: `- ${t.homeTeam} - ${t.awayTeam} -`,
    tarih_lig: t.league ? `${t.league} - ${t.date ? t.date.slice(-4) : ""}` : "",
    is_highlight: true,
    onceki_skor: "",
    kirmizi_kart_var_mi: false,
    kart_display: "",
    kart_yuksek_mi: false,
    lig_sirasi: ligSirasiHome != null && ligSirasiAway != null ? `${ligSirasiHome}-${ligSirasiAway}/${ligSirasiTotal ?? 20}` : "",
    korner_display: "",
    taraf_oranlari: {
      ev: fmtOdds(t.oddsHome),
      ber: fmtOdds(t.oddsDraw),
      dep: fmtOdds(t.oddsAway),
      kazanan: null,
      ev_acilis: fmtOdds(t.oran_1_acilis),
      ber_acilis: fmtOdds(t.oran_x_acilis),
      dep_acilis: fmtOdds(t.oran_2_acilis),
      ev_kapanis: fmtOdds(t.oran_1_kapanis ?? t.oddsHome),
      ber_kapanis: fmtOdds(t.oran_x_kapanis ?? t.oddsDraw),
      dep_kapanis: fmtOdds(t.oran_2_kapanis ?? t.oddsAway),
      ev_trend: getTrend(
        t.oran_1_acilis,
        t.oran_1_kapanis ?? t.oddsHome
      ),
      ber_trend: getTrend(
        t.oran_x_acilis,
        t.oran_x_kapanis ?? t.oddsDraw
      ),
      dep_trend: getTrend(
        t.oran_2_acilis,
        t.oran_2_kapanis ?? t.oddsAway
      )
    },
    alt_ust: {
      alt: fmtOdds(t.altOdds),
      ust: fmtOdds(t.ustOdds),
      kazanan: null,
      alt_acilis: fmtOdds(t.alt_orani_acilis),
      ust_acilis: fmtOdds(t.ust_orani_acilis),
      alt_kapanis: fmtOdds(t.alt_orani_kapanis ?? t.altOdds),
      ust_kapanis: fmtOdds(t.ust_orani_kapanis ?? t.ustOdds),
      alt_trend: getTrend(
        t.alt_orani_acilis,
        t.alt_orani_kapanis ?? t.altOdds
      ),
      ust_trend: getTrend(
        t.ust_orani_acilis,
        t.ust_orani_kapanis ?? t.ustOdds
      )
    },
    alt_ust_35: {
      alt: fmtOdds(t.altOdds35),
      ust: fmtOdds(t.ustOdds35),
      kazanan: null,
      alt_acilis: fmtOdds(t.alt_orani_35_acilis),
      ust_acilis: fmtOdds(t.ust_orani_35_acilis),
      alt_kapanis: fmtOdds(t.alt_orani_35_kapanis ?? t.altOdds35),
      ust_kapanis: fmtOdds(t.ust_orani_35_kapanis ?? t.ustOdds35),
      alt_trend: getTrend(
        t.alt_orani_35_acilis,
        t.alt_orani_35_kapanis ?? t.altOdds35
      ),
      ust_trend: getTrend(
        t.ust_orani_35_acilis,
        t.ust_orani_35_kapanis ?? t.ustOdds35
      )
    },
    iy_alt_ust_15: {
      alt: fmtOdds(t.iyAltOdds15),
      ust: fmtOdds(t.iyUstOdds15),
      kazanan: null,
      alt_acilis: fmtOdds(t.iy_alt_orani_15_acilis),
      ust_acilis: fmtOdds(t.iy_ust_orani_15_acilis),
      alt_kapanis: fmtOdds(t.iy_alt_orani_15_kapanis ?? t.iyAltOdds15),
      ust_kapanis: fmtOdds(t.iy_ust_orani_15_kapanis ?? t.iyUstOdds15),
      alt_trend: getTrend(
        t.iy_alt_orani_15_acilis,
        t.iy_alt_orani_15_kapanis ?? t.iyAltOdds15
      ),
      ust_trend: getTrend(
        t.iy_ust_orani_15_acilis,
        t.iy_ust_orani_15_kapanis ?? t.iyUstOdds15
      )
    },
    iy_alt_ust_05: {
      alt: fmtOdds(t.iyAltOdds05),
      ust: fmtOdds(t.iyUstOdds05),
      kazanan: null,
      alt_acilis: fmtOdds(t.iy_alt_orani_05_acilis),
      ust_acilis: fmtOdds(t.iy_ust_orani_05_acilis),
      alt_kapanis: fmtOdds(t.iy_alt_orani_05_kapanis ?? t.iyAltOdds05),
      ust_kapanis: fmtOdds(t.iy_ust_orani_05_kapanis ?? t.iyUstOdds05),
      alt_trend: getTrend(
        t.iy_alt_orani_05_acilis,
        t.iy_alt_orani_05_kapanis ?? t.iyAltOdds05
      ),
      ust_trend: getTrend(
        t.iy_ust_orani_05_acilis,
        t.iy_ust_orani_05_kapanis ?? t.iyUstOdds05
      )
    },
    var_yok: {
      var: fmtOdds(t.varOdds),
      yok: fmtOdds(t.yokOdds),
      kazanan: null,
      var_acilis: fmtOdds(t.kg_var_acilis),
      yok_acilis: fmtOdds(t.kg_yok_acilis),
      var_kapanis: fmtOdds(t.kg_var_kapanis ?? t.varOdds),
      yok_kapanis: fmtOdds(t.kg_yok_kapanis ?? t.yokOdds),
      var_trend: getTrend(
        t.kg_var_acilis,
        t.kg_var_kapanis ?? t.varOdds
      ),
      yok_trend: getTrend(
        t.kg_yok_acilis,
        t.kg_yok_kapanis ?? t.yokOdds
      )
    },
    ortalama: calcOrtalamaString(t),
    im_sonuc: "",
    im_renk: ""
  });
  referenceMatches.forEach((m, idx) => {
    const ft = parseScore(m.ftScore);
    const ht = parseScore(m.htScore);
    const oddsWinner = resultType(m.ftScore);
    const totalGoalsFt = ft ? ft.home + ft.away : 0;
    const altUstWinner = ft ? totalGoalsFt > 2.5 ? "ust" : "alt" : null;
    const altUstWinner35 = ft ? totalGoalsFt > 3.5 ? "ust" : "alt" : null;
    const totalGoalsHt = ht ? ht.home + ht.away : 0;
    const iyAltUstWinner15 = ht ? totalGoalsHt > 1.5 ? "ust" : "alt" : null;
    const iyAltUstWinner05 = ht ? totalGoalsHt > 0.5 ? "ust" : "alt" : null;
    const btts = ft ? ft.home > 0 && ft.away > 0 : false;
    const varYokWinner = ft ? btts ? "var" : "yok" : null;
    const totalMatchCards = (m.yellowCardsHome ?? 0) + (m.yellowCardsAway ?? 0) + (m.redCards ?? 0);
    const ftKey = ft ? `${ft.home}:${ft.away}` : null;
    const htKey = ht ? `${ht.home}:${ht.away}` : null;
    tablo_satirlari.push({
      id: m.id ?? `ref-${idx + 1}`,
      is_target: false,
      analiz_yuzde: m.similarityScore ? `%${m.similarityScore}` : analiz_yuzde_str,
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
      tarih_lig: m.league ? `${m.league} - ${(m.matchDate || m.tarih || "").slice(-4)}` : "",
      is_highlight: false,
      onceki_skor: m.previousScore ?? "",
      kirmizi_kart_var_mi: (m.redCards ?? 0) > 0,
      kart_display: m.yellowCardsHome != null || m.yellowCardsAway != null ? `${fmtCard(m.yellowCardsHome)} - ${fmtCard(m.yellowCardsAway)} - ${m.redCards ?? 0}` : "",
      kart_yuksek_mi: totalMatchCards >= 5,
      lig_sirasi: m.ligSirasiHome != null && m.ligSirasiAway != null ? `${m.ligSirasiHome}-${m.ligSirasiAway}/${m.ligSirasiTotal ?? 20}` : "",
      taraf_oranlari: {
        ev: fmtOdds(m.oddsHome),
        ber: fmtOdds(m.oddsDraw),
        dep: fmtOdds(m.oddsAway),
        kazanan: oddsWinner,
        ev_acilis: fmtOdds(m.oran_1_acilis),
        ber_acilis: fmtOdds(m.oran_x_acilis),
        dep_acilis: fmtOdds(m.oran_2_acilis),
        ev_kapanis: fmtOdds(m.oran_1_kapanis),
        ber_kapanis: fmtOdds(m.oran_x_kapanis),
        dep_kapanis: fmtOdds(m.oran_2_kapanis),
        ev_trend: getTrend(
          m.oran_1_acilis,
          m.oran_1_kapanis ?? m.oddsHome
        ),
        ber_trend: getTrend(
          m.oran_x_acilis,
          m.oran_x_kapanis ?? m.oddsDraw
        ),
        dep_trend: getTrend(
          m.oran_2_acilis,
          m.oran_2_kapanis ?? m.oddsAway
        )
      },
      alt_ust: {
        alt: fmtOdds(m.altOdds),
        ust: fmtOdds(m.ustOdds),
        kazanan: altUstWinner,
        alt_acilis: fmtOdds(m.alt_orani_acilis),
        ust_acilis: fmtOdds(m.ust_orani_acilis),
        alt_kapanis: fmtOdds(m.alt_orani_kapanis),
        ust_kapanis: fmtOdds(m.ust_orani_kapanis),
        alt_trend: getTrend(
          m.alt_orani_acilis,
          m.alt_orani_kapanis ?? m.altOdds
        ),
        ust_trend: getTrend(
          m.ust_orani_acilis,
          m.ust_orani_kapanis ?? m.ustOdds
        )
      },
      alt_ust_35: {
        alt: fmtOdds(m.altOdds35),
        ust: fmtOdds(m.ustOdds35),
        kazanan: altUstWinner35,
        alt_acilis: fmtOdds(m.alt_orani_35_acilis),
        ust_acilis: fmtOdds(m.ust_orani_35_acilis),
        alt_kapanis: fmtOdds(m.alt_orani_35_kapanis),
        ust_kapanis: fmtOdds(m.ust_orani_35_kapanis),
        alt_trend: getTrend(
          m.alt_orani_35_acilis,
          m.alt_orani_35_kapanis ?? m.altOdds35
        ),
        ust_trend: getTrend(
          m.ust_orani_35_acilis,
          m.ust_orani_35_kapanis ?? m.ustOdds35
        )
      },
      iy_alt_ust_15: {
        alt: fmtOdds(m.iyAltOdds15),
        ust: fmtOdds(m.iyUstOdds15),
        kazanan: iyAltUstWinner15,
        alt_acilis: fmtOdds(m.iy_alt_orani_15_acilis),
        ust_acilis: fmtOdds(m.iy_ust_orani_15_acilis),
        alt_kapanis: fmtOdds(m.iy_alt_orani_15_kapanis),
        ust_kapanis: fmtOdds(m.iy_ust_orani_15_kapanis),
        alt_trend: getTrend(
          m.iy_alt_orani_15_acilis,
          m.iy_alt_orani_15_kapanis ?? m.iyAltOdds15
        ),
        ust_trend: getTrend(
          m.iy_ust_orani_15_acilis,
          m.iy_ust_orani_15_kapanis ?? m.iyUstOdds15
        )
      },
      iy_alt_ust_05: {
        alt: fmtOdds(m.iyAltOdds05),
        ust: fmtOdds(m.iyUstOdds05),
        kazanan: iyAltUstWinner05,
        alt_acilis: fmtOdds(m.iy_alt_orani_05_acilis),
        ust_acilis: fmtOdds(m.iy_ust_orani_05_acilis),
        alt_kapanis: fmtOdds(m.iy_alt_orani_05_kapanis),
        ust_kapanis: fmtOdds(m.iy_ust_orani_05_kapanis),
        alt_trend: getTrend(
          m.iy_alt_orani_05_acilis,
          m.iy_alt_orani_05_kapanis ?? m.iyAltOdds05
        ),
        ust_trend: getTrend(
          m.iy_ust_orani_05_acilis,
          m.iy_ust_orani_05_kapanis ?? m.iyUstOdds05
        )
      },
      var_yok: {
        var: fmtOdds(m.varOdds),
        yok: fmtOdds(m.yokOdds),
        kazanan: varYokWinner,
        var_acilis: fmtOdds(m.kg_var_acilis),
        yok_acilis: fmtOdds(m.kg_yok_acilis),
        var_kapanis: fmtOdds(m.kg_var_kapanis),
        yok_kapanis: fmtOdds(m.kg_yok_kapanis),
        var_trend: getTrend(
          m.kg_var_acilis,
          m.kg_var_kapanis ?? m.varOdds
        ),
        yok_trend: getTrend(
          m.kg_yok_acilis,
          m.kg_yok_kapanis ?? m.yokOdds
        )
      },
      ortalama: calcOrtalamaString(m),
      korner_display: m.kornerHome != null || m.kornerAway != null ? `${m.kornerHome ?? "-"}-${m.kornerAway ?? "-"} (${(m.kornerHome ?? 0) + (m.kornerAway ?? 0)})` : "",
      im_sonuc: m.imResult || (() => {
        const ht2 = parseScore(m.htScore);
        const ft2 = parseScore(m.ftScore);
        if (!ht2 || !ft2) return "";
        const _ht = ht2.home > ht2.away ? "1" : ht2.home < ht2.away ? "2" : "X";
        const _ft = ft2.home > ft2.away ? "1" : ft2.home < ft2.away ? "2" : "X";
        return `${_ht}/${_ft}`;
      })(),
      im_renk: imRenk(
        m.imResult || (() => {
          const ht2 = parseScore(m.htScore);
          const ft2 = parseScore(m.ftScore);
          if (!ht2 || !ft2) return "";
          const _ht = ht2.home > ht2.away ? "1" : ht2.home < ht2.away ? "2" : "X";
          const _ft = ft2.home > ft2.away ? "1" : ft2.home < ft2.away ? "2" : "X";
          return `${_ht}/${_ft}`;
        })()
      )
    });
  });
  return {
    analiz_ozet,
    tahminler,
    tablo_satirlari,
    poisson_probs: {
      pHome: pHomeWin,
      pDraw,
      pAway: pAwayWin,
      pOver25,
      pBtts
    }
  };
}

// src/scripts/backfillPredictions.ts
var __dirnameLocal = path2.dirname(fileURLToPath2(import.meta.url));
var DB_PATH2 = __require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path2.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");
function parseScore2(scoreStr) {
  if (!scoreStr) return null;
  const match = scoreStr.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  return { h: parseInt(match[1]), a: parseInt(match[2]) };
}
function evaluatePred(predType, predValue, ftScore) {
  if (/[a-zA-Z]/.test(ftScore)) return "void";
  const ft = parseScore2(ftScore);
  if (!ft) return "pending";
  const { h, a } = ft;
  const total = h + a;
  const kg = h > 0 && a > 0;
  if (predType === "MS") {
    if (predValue === "1" && h > a) return "correct";
    if (predValue === "X" && h === a) return "correct";
    if (predValue === "2" && h < a) return "correct";
    return "incorrect";
  }
  if (predType === "OU") {
    if (predValue === "UST" && total >= 3) return "correct";
    if (predValue === "ALT" && total <= 2) return "correct";
    return "incorrect";
  }
  if (predType === "BTTS") {
    if (predValue === "VAR" && kg) return "correct";
    if (predValue === "YOK" && !kg) return "correct";
    return "incorrect";
  }
  return "pending";
}
async function runBackfill() {
  const db = new Database2(DB_PATH2);
  const query = `
    SELECT * FROM gecmis_maclar 
    WHERE 1=1
      AND mac_skoru IS NOT NULL 
      AND mac_skoru != ''
      AND mac_skoru NOT LIKE '%a%' 
      AND mac_skoru NOT LIKE '%P%'
    ORDER BY id DESC LIMIT 300
  `;
  const recentMatches = db.prepare(query).all();
  console.log(`Bulunan son 30 g\xFCn ma\xE7\u0131: ${recentMatches.length}`);
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
    if (!m.oran_1 || !m.oran_x || !m.oran_2) continue;
    const refsRaw = queryScraperMatches(m.oran_1, m.oran_x, m.oran_2, "CLOSING", m.lig, 15e3);
    const similar = findSimilarMatches({
      oddsHome: m.oran_1,
      oddsDraw: m.oran_x,
      oddsAway: m.oran_2,
      altOdds: m.alt_orani,
      ustOdds: m.ust_orani,
      varOdds: m.kg_var,
      yokOdds: m.kg_yok,
      league: m.lig,
      ligSirasiDiff: m.lig_sira_ev && m.lig_sira_dep ? Math.abs(m.lig_sira_ev - m.lig_sira_dep) : null,
      maxResults: 25
    }, refsRaw);
    const validRefs = similar.filter((s) => s.match.id !== String(m.id)).map((s) => s.match);
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
    const msProb = Math.max(analysis.analiz_ozet.ev_sahibi.yuzde, analysis.analiz_ozet.beraberlik.yuzde, analysis.analiz_ozet.deplasman.yuzde);
    const msPred = msProb === analysis.analiz_ozet.ev_sahibi.yuzde ? "1" : msProb === analysis.analiz_ozet.beraberlik.yuzde ? "X" : "2";
    const ouProb = Math.max(analysis.analiz_ozet.ust_25.yuzde, 100 - analysis.analiz_ozet.ust_25.yuzde);
    const ouPred = ouProb === analysis.analiz_ozet.ust_25.yuzde ? "UST" : "ALT";
    const bttsProb = Math.max(analysis.analiz_ozet.kg_var.yuzde, 100 - analysis.analiz_ozet.kg_var.yuzde);
    const bttsPred = bttsProb === analysis.analiz_ozet.kg_var.yuzde ? "VAR" : "YOK";
    const msStat = evaluatePred("MS", msPred, m.mac_skoru);
    const ouStat = evaluatePred("OU", ouPred, m.mac_skoru);
    const bttsStat = evaluatePred("BTTS", bttsPred, m.mac_skoru);
    try {
      insertStmt.run(
        m.id,
        m.tarih,
        m.lig,
        msPred,
        msProb,
        msStat,
        ouPred,
        ouProb,
        ouStat,
        bttsPred,
        bttsProb,
        bttsStat
      );
      count++;
    } catch (e) {
    }
  }
  console.log(`Backfill tamamland\u0131: ${count} ma\xE7 eklendi.`);
}
if (__require.main === module) {
  runBackfill().then(() => process.exit(0));
}
export {
  runBackfill
};
//# sourceMappingURL=backfillPredictions.mjs.map
