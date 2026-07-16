/**
 * Scraper SQLite bağlantısı — gecmis_maclar.db okur, find-similar için satırları
 * HistoricalMatch şekline dönüştürür. Sadece okuma; yazma yok.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { HistoricalMatch } from "@workspace/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo kökünden yol: artifacts/api-server/dist -> ../../../../scripts/scraper/
const DB_PATH = path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");

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
  im_6: string | null;
  korner_ev: number | null;
  korner_dep: number | null;
  olusturma_tarihi: string | null;
}

/** SQLite satırını HistoricalMatch şekline dönüştür */
function toHistoricalMatch(row: ScraperRow): HistoricalMatch {
  return {
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
    oddsHome: row.oran_1 != null ? String(row.oran_1) : "0",
    oddsDraw: row.oran_x != null ? String(row.oran_x) : "0",
    oddsAway: row.oran_2 != null ? String(row.oran_2) : "0",
    altOdds: row.alt_orani != null ? String(row.alt_orani) : null,
    ustOdds: row.ust_orani != null ? String(row.ust_orani) : null,
    varOdds: row.kg_var != null ? String(row.kg_var) : null,
    yokOdds: row.kg_yok != null ? String(row.kg_yok) : null,
    avgOddsMin: row.ort_min != null ? String(row.ort_min) : null,
    avgOddsMax: row.ort_max != null ? String(row.ort_max) : null,
    imResult: row.im_6 ?? null,
    kornerHome: row.korner_ev ?? null,
    kornerAway: row.korner_dep ?? null,
    createdAt: row.olusturma_tarihi ? new Date(row.olusturma_tarihi) : new Date(),
  };
}

/**
 * Odds aralığına göre ön-filtre uygulayarak benzer maçlar için aday satırları döndürür.
 * Tolerans 2× MAIN_ODDS_TOL = 0.30 (JS similarity zaten daha ince puanlar).
 */
export function queryScraperMatches(
  oddsHome: number,
  oddsDraw: number,
  oddsAway: number
): HistoricalMatch[] {
  const db = getDb();
  const TOL = 0.35; // biraz geniş tut; JS katmanı kesin hesaplar
  const stmt = db.prepare<[number, number, number, number, number, number], ScraperRow>(`
    SELECT *
    FROM gecmis_maclar
    WHERE oran_1 IS NOT NULL
      AND oran_x IS NOT NULL
      AND oran_2 IS NOT NULL
      AND oran_1 BETWEEN ? AND ?
      AND oran_x BETWEEN ? AND ?
      AND oran_2 BETWEEN ? AND ?
  `);
  const rows = stmt.all(
    oddsHome - TOL, oddsHome + TOL,
    oddsDraw - TOL, oddsDraw + TOL,
    oddsAway - TOL, oddsAway + TOL
  );
  return rows.map(toHistoricalMatch);
}

/** DB kaç maç içeriyor (admin/info için) */
export function getScraperMatchCount(): number {
  try {
    const db = getDb();
    const row = db.prepare<[], { cnt: number }>("SELECT COUNT(*) as cnt FROM gecmis_maclar").get();
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}
