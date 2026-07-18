/**
 * Basketbol Scraper SQLite bağlantısı — basketbol_maclar.db okur.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../../scripts/scraper/basketbol_maclar.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export interface BasketHistoricalMatch {
  id: number;
  matchDate: string | null;
  saat: string | null;
  league: string;
  homeTeam: string;
  awayTeam: string;
  ftScore: string;
  htScore: string | null;
  periodScores: string | null;
  oran_1: number | null;
  oran_2: number | null;
  handikap_limit: number | null;
  oran_h1: number | null;
  oran_h2: number | null;
  toplam_limit: number | null;
  oran_alt: number | null;
  oran_ust: number | null;
}

interface ScraperRow {
  id: number;
  tarih: string | null;
  saat: string | null;
  lig: string | null;
  ev_sahibi: string;
  deplasman: string;
  mac_skoru: string | null;
  devre_skoru: string | null;
  periyot_skorlari: string | null;
  oran_1: number | null;
  oran_2: number | null;
  handikap_limit: number | null;
  oran_h1: number | null;
  oran_h2: number | null;
  toplam_limit: number | null;
  oran_alt: number | null;
  oran_ust: number | null;
}

function toBasketHistoricalMatch(row: ScraperRow): BasketHistoricalMatch {
  return {
    id: row.id,
    matchDate: row.tarih ?? null,
    saat: row.saat ?? null,
    league: row.lig ?? "",
    homeTeam: row.ev_sahibi,
    awayTeam: row.deplasman,
    ftScore: row.mac_skoru ?? "?:?",
    htScore: row.devre_skoru ?? null,
    periodScores: row.periyot_skorlari ?? null,
    oran_1: row.oran_1 ?? null,
    oran_2: row.oran_2 ?? null,
    handikap_limit: row.handikap_limit ?? null,
    oran_h1: row.oran_h1 ?? null,
    oran_h2: row.oran_h2 ?? null,
    toplam_limit: row.toplam_limit ?? null,
    oran_alt: row.oran_alt ?? null,
    oran_ust: row.oran_ust ?? null,
  };
}

/** Moneyline oranlarına göre benzer aday basketbol maçlarını getirir */
export function queryBasketScraperMatches(
  oran_1: number,
  oran_2: number
): BasketHistoricalMatch[] {
  try {
    const db = getDb();
    const TOL = 0.35; // Oran toleransı
    const stmt = db.prepare<[number, number, number, number], ScraperRow>(`
      SELECT *
      FROM basketbol_maclar
      WHERE oran_1 IS NOT NULL
        AND oran_2 IS NOT NULL
        AND mac_skoru IS NOT NULL
        AND mac_skoru != '?:?'
        AND mac_skoru != ''
        AND mac_skoru NOT LIKE '%?%'
        AND oran_1 BETWEEN ? AND ?
        AND oran_2 BETWEEN ? AND ?
    `);
    const rows = stmt.all(
      oran_1 - TOL, oran_1 + TOL,
      oran_2 - TOL, oran_2 + TOL
    );
    return rows.map(toBasketHistoricalMatch);
  } catch (e) {
    return [];
  }
}

/** Belirtilen tarihe ait basketbol bültenini çeker */
export function queryTodayBasketMatches(dateStr: string): BasketHistoricalMatch[] {
  try {
    const db = getDb();
    const stmt = db.prepare<[string], ScraperRow>(`
      SELECT *
      FROM basketbol_maclar
      WHERE tarih = ?
      ORDER BY saat ASC, lig ASC
    `);
    const rows = stmt.all(dateStr);
    return rows.map(toBasketHistoricalMatch);
  } catch (e) {
    return [];
  }
}

/** DB kaç basketbol maçı içeriyor */
export function getBasketScraperMatchCount(): number {
  try {
    const db = getDb();
    const row = db.prepare<[], { cnt: number }>("SELECT COUNT(*) as cnt FROM basketbol_maclar").get();
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}
