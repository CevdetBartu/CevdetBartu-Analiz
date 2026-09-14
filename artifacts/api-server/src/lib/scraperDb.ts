/**
 * Scraper SQLite bağlantısı — gecmis_maclar.db okur, find-similar için satırları
 * HistoricalMatch şekline dönüştürür. Sadece okuma; yazma yok.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { HistoricalMatch } from "@workspace/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo kökünden yol: artifacts/api-server/dist -> ../../../scripts/scraper/
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

interface ScraperRow {
  id: number;
  tarih: string | null;
  saat: string | null;
  lig: string | null;
  ev_sahibi: string;
  deplasman: string;
  devre_skoru: string | null;
  mac_skoru: string | null;
  onceki_skorlar: string | null;
  kart_ev: number | null;
  kart_dep: number | null;
  kirmizi_kart: number | null;
  lig_sira_ev: number | null;
  lig_sira_dep: number | null;
  toplam_takim: number | null;
  oran_1: number | null;
  oran_x: number | null;
  oran_2: number | null;
  alt_orani: number | null;
  ust_orani: number | null;
  kg_var: number | null;
  kg_yok: number | null;
  ort_min: number | null;
  ort_max: number | null;
  oran_1_acilis: number | null;
  oran_x_acilis: number | null;
  oran_2_acilis: number | null;
  alt_orani_acilis: number | null;
  ust_orani_acilis: number | null;
  kg_var_acilis: number | null;
  kg_yok_acilis: number | null;
  alt_orani_35: number | null;
  ust_orani_35: number | null;
  alt_orani_35_acilis: number | null;
  ust_orani_35_acilis: number | null;
  iy_alt_orani_15: number | null;
  iy_ust_orani_15: number | null;
  iy_alt_orani_15_acilis: number | null;
  iy_ust_orani_15_acilis: number | null;
  iy_alt_orani_05: number | null;
  iy_ust_orani_05: number | null;
  iy_alt_orani_05_acilis: number | null;
  iy_ust_orani_05_acilis: number | null;
  im_6: string | null;
  korner_ev: number | null;
  korner_dep: number | null;
  kita: string | null;
  lig_seviyesi: string | null;
  teknik_direktor_ev: string | null;
  teknik_direktor_dep: string | null;
  hakem: string | null;
  stadyum: string | null;
  olusturma_tarihi: string | null;
}

/** SQLite satırını HistoricalMatch şekline dönüştür */
export function toHistoricalMatch(row: ScraperRow, oddsType: "OPENING" | "CLOSING" = "CLOSING"): HistoricalMatch {
  // "EKSİK ORANI DOLDURMAK İÇİN ORAN EKLEME. TAMAMEN %100 REEL ORANLAR OLMALI."
  // Kullanıcı kesinlikle eksik oranların başka bir oranla doldurulmasını istemiyor.
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

  const cleanNum = (v: number | null | undefined) => (v != null && v > 1.01 ? v : null);
  const cleanStr = (v: number | null | undefined) => (v != null && v > 1.01 ? String(v) : null);

  const match: any = {
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
    createdAt: row.olusturma_tarihi ? new Date(row.olusturma_tarihi) : new Date(),
    
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
    iy_ust_orani_05_kapanis: cleanNum(row.iy_ust_orani_05),
  };
  return match;
}

/**
 * Odds aralığına göre ön-filtre uygulayarak benzer maçlar için aday satırları döndürür.
 */
export function queryScraperMatches(
  oddsHome: number,
  oddsDraw: number,
  oddsAway: number,
  oddsType: "OPENING" | "CLOSING" = "CLOSING",
  targetLeague?: string | null,
  maxLimit: number = 15000
): HistoricalMatch[] {
  const db = getDb();
  
  if (!oddsHome || !oddsDraw || !oddsAway || oddsHome <= 1.01 || oddsDraw <= 1.01 || oddsAway <= 1.01) {
    // Oran yoksa sadece oynanmış maçları listele, similarity.ts zaten lig ve takıma göre eşleştirecek
    const stmt = db.prepare<any, ScraperRow>(`
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
    const rows = stmt.all();
    return rows.map((r) => toHistoricalMatch(r, oddsType));
  }

  // Olasılık Bazlı Filtreleme: Oranlar yerine olasılık farkı (±%8) bazında arama yapıyoruz
  // Increase tolerance to 0.08 to prevent empty result sets on obscure odds
  const TOL_PROB = 0.080; 

  const p1 = 1.0 / oddsHome;
  const px = 1.0 / oddsDraw;
  const p2 = 1.0 / oddsAway;

  const minHome = 1.0 / (p1 + TOL_PROB);
  const maxHome = 1.0 / Math.max(0.01, p1 - TOL_PROB);

  const minDraw = 1.0 / (px + TOL_PROB);
  const maxDraw = 1.0 / Math.max(0.01, px - TOL_PROB);

  const minAway = 1.0 / (p2 + TOL_PROB);
  const maxAway = 1.0 / Math.max(0.01, p2 - TOL_PROB);

  const hCol = oddsType === "OPENING" ? "oran_1_acilis" : "oran_1";
  const xCol = oddsType === "OPENING" ? "oran_x_acilis" : "oran_x";
  const aCol = oddsType === "OPENING" ? "oran_2_acilis" : "oran_2";

  const stmt = db.prepare<any, ScraperRow>(`
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
    minHome, maxHome,
    minDraw, maxDraw,
    minAway, maxAway,
    
  );
  return rows.map((r) => toHistoricalMatch(r, oddsType));
}

/** DB kaç maç içeriyor (admin/info için) */
export function getScraperMatchCount(): number {
  try {
    const db = getDb();
    const row = db.prepare<[], { cnt: number }>(`
      SELECT COUNT(*) as cnt 
      FROM gecmis_maclar 
      WHERE (
        CASE 
          WHEN tarih LIKE '%.%' AND LENGTH(tarih) >= 10 THEN 
            SUBSTR(tarih, 7, 4) || '-' || SUBSTR(tarih, 4, 2) || '-' || SUBSTR(tarih, 1, 2)
          WHEN tarih LIKE '%-%' AND LENGTH(tarih) >= 10 THEN 
            SUBSTR(tarih, 1, 10)
          ELSE NULL 
        END
      ) >= '2021-08-15'
    `).get();
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

/** Lig bazlı tarihsel gol ortalamalarını (prior) getir */
export function getLeagueGoalAverages(leagueName: string): { homePrior: number; awayPrior: number } {
  try {
    const db = getDb();
    const raw = (leagueName || "").trim();
    
    // Normalize punctuation and English/Turkish tokens
    const cleanLeague = raw
      .replace(/-/g, " ")
      .replace(/South Korea/gi, "Güney Kore")
      .replace(/Japan/gi, "Japonya")
      .replace(/Brazil/gi, "Brezilya")
      .replace(/Germany/gi, "Almanya")
      .replace(/France/gi, "Fransa")
      .replace(/Italy/gi, "İtalya")
      .replace(/Spain/gi, "İspanya")
      .replace(/England/gi, "İngiltere")
      .replace(/League/gi, "Lig")
      .replace(/\s+/g, " ")
      .trim();

    const likeLeague = `%${cleanLeague}%`;
    
    let row = db.prepare(`
      SELECT 
        AVG(CAST(SUBSTR(mac_skoru, 1, INSTR(mac_skoru, ':') - 1) AS REAL)) as avg_home,
        AVG(CAST(SUBSTR(mac_skoru, INSTR(mac_skoru, ':') + 1) AS REAL)) as avg_away
      FROM gecmis_maclar
      WHERE (lig = ? OR lig LIKE ? OR ? LIKE '%' || lig || '%')
        AND mac_skoru LIKE '%:%'
        AND mac_skoru NOT LIKE '%?%'
    `).get(cleanLeague, likeLeague, raw) as { avg_home: number | null; avg_away: number | null } | undefined;

    if (row && row.avg_home !== null && row.avg_away !== null) {
      return {
        homePrior: Math.round(row.avg_home * 100) / 100,
        awayPrior: Math.round(row.avg_away * 100) / 100
      };
    }
  } catch (e) {
    console.error("getLeagueGoalAverages error:", e);
  }
  return { homePrior: 1.35, awayPrior: 1.15 }; // Varsayılan fallback
}

export function getTeamStandingsFallback(
  league: string,
  team: string
): { position: number; totalTeams: number } | null {
  try {
    const db = getDb();
    
    // 1. Try with league filter first (exact or flexible)
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
      cleanLeague, likeLeague, cleanLeague, team,
      cleanLeague, likeLeague, cleanLeague, team
    ) as { pos: number; total: number } | undefined;
    
    // 2. If not found, fall back to team name only
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
      row = stmt2.get(team, team) as { pos: number; total: number } | undefined;
    }
    
    if (row) {
      return { position: row.pos, totalTeams: row.total };
    }
  } catch (e) {
    console.error("getTeamStandingsFallback error:", e);
  }
  return null;
}

function normalizeTr(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIıi]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")
    .toLowerCase()
    .trim();
}

/**
 * H2H Maçlarını Sorgula — İki takım arasındaki tüm geçmiş maçları getirir (Türkçe karakter duyarsız).
 */
export function queryH2HMatches(t1: string, t2: string): HistoricalMatch[] {
  try {
    const db = getDb();
    const t1Norm = normalizeTr(t1);
    const t2Norm = normalizeTr(t2);

    const stmt = db.prepare(`SELECT * FROM gecmis_maclar ORDER BY id DESC`);
    const allRows = stmt.all() as ScraperRow[];

    const matched = allRows.filter(r => {
      const homeNorm = normalizeTr(r.ev_sahibi);
      const awayNorm = normalizeTr(r.deplasman);

      const isDirect = (homeNorm.includes(t1Norm) && awayNorm.includes(t2Norm)) ||
                       (homeNorm.includes(t2Norm) && awayNorm.includes(t1Norm));
      return isDirect;
    });

    return matched.slice(0, 100).map(r => toHistoricalMatch(r, "CLOSING"));
  } catch (e) {
    console.error("queryH2HMatches error:", e);
    return [];
  }
}



