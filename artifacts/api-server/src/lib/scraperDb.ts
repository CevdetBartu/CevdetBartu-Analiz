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
  oran_1_acilis: number | null;
  oran_x_acilis: number | null;
  oran_2_acilis: number | null;
  alt_orani_acilis: number | null;
  ust_orani_acilis: number | null;
  kg_var_acilis: number | null;
  kg_yok_acilis: number | null;
  im_6: string | null;
  korner_ev: number | null;
  korner_dep: number | null;
  olusturma_tarihi: string | null;
}

/** SQLite satırını HistoricalMatch şekline dönüştür */
export function toHistoricalMatch(row: ScraperRow, oddsType: "OPENING" | "CLOSING" = "CLOSING"): HistoricalMatch {
  // Açılış oranları istenmişse ve kolonda veri varsa açılış kolonlarını kullan, yoksa normal kolonlar
  const useOpening = oddsType === "OPENING";
  const o1 = useOpening ? (row.oran_1_acilis ?? row.oran_1) : row.oran_1;
  const ox = useOpening ? (row.oran_x_acilis ?? row.oran_x) : row.oran_x;
  const o2 = useOpening ? (row.oran_2_acilis ?? row.oran_2) : row.oran_2;
  const alt = useOpening ? (row.alt_orani_acilis ?? row.alt_orani) : row.alt_orani;
  const ust = useOpening ? (row.ust_orani_acilis ?? row.ust_orani) : row.ust_orani;
  const kv = useOpening ? (row.kg_var_acilis ?? row.kg_var) : row.kg_var;
  const ky = useOpening ? (row.kg_yok_acilis ?? row.kg_yok) : row.kg_yok;

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
    oddsHome: o1 != null ? String(o1) : "0",
    oddsDraw: ox != null ? String(ox) : "0",
    oddsAway: o2 != null ? String(o2) : "0",
    altOdds: alt != null ? String(alt) : null,
    ustOdds: ust != null ? String(ust) : null,
    varOdds: kv != null ? String(kv) : null,
    yokOdds: ky != null ? String(ky) : null,
    avgOddsMin: row.ort_min != null ? String(row.ort_min) : null,
    avgOddsMax: row.ort_max != null ? String(row.ort_max) : null,
    imResult: row.im_6 ?? null,
    kornerHome: row.korner_ev ?? null,
    kornerAway: row.korner_dep ?? null,
    createdAt: row.olusturma_tarihi ? new Date(row.olusturma_tarihi) : new Date(),
    
    // Açılış ve kapanış oranlarını ayrı detay olarak ekle (ön yüz tooltip gösterimi vs. için)
    oran_1_acilis: row.oran_1_acilis ?? o1,
    oran_x_acilis: row.oran_x_acilis ?? ox,
    oran_2_acilis: row.oran_2_acilis ?? o2,
    alt_orani_acilis: row.alt_orani_acilis ?? alt,
    ust_orani_acilis: row.ust_orani_acilis ?? ust,
    kg_var_acilis: row.kg_var_acilis ?? kv,
    kg_yok_acilis: row.kg_yok_acilis ?? ky,
    
    oran_1_kapanis: row.oran_1,
    oran_x_kapanis: row.oran_x,
    oran_2_kapanis: row.oran_2,
    alt_orani_kapanis: row.alt_orani,
    ust_orani_kapanis: row.ust_orani,
    kg_var_kapanis: row.kg_var,
    kg_yok_kapanis: row.kg_yok,
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
  oddsType: "OPENING" | "CLOSING" = "CLOSING"
): HistoricalMatch[] {
  const db = getDb();
  const TOL = 0.35; 
  
  const hCol = oddsType === "OPENING" ? "oran_1_acilis" : "oran_1";
  const xCol = oddsType === "OPENING" ? "oran_x_acilis" : "oran_x";
  const aCol = oddsType === "OPENING" ? "oran_2_acilis" : "oran_2";

  const stmt = db.prepare<[number, number, number, number, number, number], ScraperRow>(`
    SELECT *
    FROM gecmis_maclar
    WHERE ${hCol} IS NOT NULL
      AND ${xCol} IS NOT NULL
      AND ${aCol} IS NOT NULL
      AND mac_skoru IS NOT NULL
      AND mac_skoru != '?:?'
      AND mac_skoru != ''
      AND mac_skoru NOT LIKE '%?%'
      AND ${hCol} BETWEEN ? AND ?
      AND ${xCol} BETWEEN ? AND ?
      AND ${aCol} BETWEEN ? AND ?
  `);
  const rows = stmt.all(
    oddsHome - TOL, oddsHome + TOL,
    oddsDraw - TOL, oddsDraw + TOL,
    oddsAway - TOL, oddsAway + TOL
  );
  return rows.map((r) => toHistoricalMatch(r, oddsType));
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
