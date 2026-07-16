/**
 * Bugünün maçları — SQLite veri okuma ve SofaScore'dan veri çekme.
 * Scraper Python tarafında çalışır; bu modül sadece mevcut DB'yi okur ve
 * Python scraper'ını tetikler (REST üzerinden).
 */
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");

const FLASK_URL = "http://127.0.0.1:5051";

interface TodayRow {
  id: number;
  tarih: string | null;
  saat: string | null;
  lig: string | null;
  ev_sahibi: string;
  deplasman: string;
  oran_1: number | null;
  oran_x: number | null;
  oran_2: number | null;
  alt_orani: number | null;
  ust_orani: number | null;
  kg_var: number | null;
  kg_yok: number | null;
  durum: string | null;
  olusturma_tarihi: string | null;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database | null {
  try {
    if (!_db) {
      _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    }
    return _db;
  } catch {
    return null;
  }
}

/**
 * Belirtilen tarihe ait maçları veritabanından getirir.
 * Tarih formatı: "YYYY-MM-DD" ya da "DD.MM.YYYY"
 */
export function getTodayMatchesFromDb(dateStr: string): {
  date: string;
  matches: TodayRow[];
  total: number;
  last_updated: string | null;
} {
  const db = getDb();
  if (!db) {
    return { date: dateStr, matches: [], total: 0, last_updated: null };
  }

  // football-data.co.uk DD.MM.YYYY, sofascore YYYY-MM-DD kullanır — ikisini de ara
  let dotDate = dateStr;
  let isoDate = dateStr;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    dotDate = `${d}.${m}.${y}`;
    isoDate = dateStr;
  } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split(".");
    isoDate = `${y}-${m}-${d}`;
    dotDate = dateStr;
  }

  try {
    const stmt = db.prepare<[string, string], TodayRow>(`
      SELECT id, tarih, saat, lig, ev_sahibi, deplasman,
             oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok,
             'tamamlandi' AS durum, olusturma_tarihi
      FROM gecmis_maclar
      WHERE tarih = ? OR tarih = ?
      ORDER BY saat ASC, lig ASC
    `);
    const rows = stmt.all(dotDate, isoDate);

    // Son güncelleme zamanını bul
    const lastStmt = db.prepare<[], { max_tarih: string | null }>(`
      SELECT MAX(olusturma_tarihi) as max_tarih FROM gecmis_maclar WHERE tarih = ? OR tarih = ?
    `);
    const lastRow = (lastStmt as any).get(dotDate, isoDate) as { max_tarih: string | null };

    return {
      date: isoDate,
      matches: rows,
      total: rows.length,
      last_updated: lastRow?.max_tarih ?? null,
    };
  } catch (e: any) {
    logger.error({ err: e }, "getTodayMatchesFromDb error");
    return { date: dateStr, matches: [], total: 0, last_updated: null };
  }
}

/**
 * Bugünün maçlarını yenilemek için Python scraper'ı tetikler.
 */
export async function refreshTodayMatches(): Promise<{
  ok: boolean;
  message: string;
  added?: number;
  updated?: number;
}> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const resp = await fetch(`${FLASK_URL}/today`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      // Scraper çevrimdışı olabilir — hata döndür
      return {
        ok: false,
        message: `Scraper yanıt vermedi (${resp.status}). python3 scripts/scraper/run.py komutunu çalıştırın.`,
      };
    }

    const data = await resp.json() as { ok: boolean; message: string; added?: number; updated?: number };
    return data;
  } catch (e: any) {
    return {
      ok: false,
      message: `Scraper bağlantı hatası: ${e.message ?? "Bilinmeyen hata"}. python3 scripts/scraper/run.py komutunu çalıştırın.`,
    };
  }
}
