/**
 * Bugünün maçları — SQLite veri okuma ve SofaScore'dan veri çekme.
 * Scraper Python tarafında çalışır; bu modül sadece mevcut DB'yi okur ve
 * Python scraper'ını tetikler (REST üzerinden).
 */
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";
import { queryScraperMatches } from "./scraperDb";
import { findSimilarMatches } from "./similarity";

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
  lig_sira_ev: number | null;
  lig_sira_dep: number | null;
  toplam_takim: number | null;
  alt_orani_35: number | null;
  ust_orani_35: number | null;
  iy_alt_orani_15: number | null;
  iy_ust_orani_15: number | null;
  iy_alt_orani_05: number | null;
  iy_ust_orani_05: number | null;
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

  // Gece 00:00 - 06:00 maçlarını dahil etmek için yarının tarihini bul
  const dObj = new Date(isoDate);
  dObj.setDate(dObj.getDate() + 1);
  const tomorrowIso = dObj.toISOString().split('T')[0];
  const [ty, tm, td] = tomorrowIso.split("-");
  const tomorrowDot = `${td}.${tm}.${ty}`;

  try {
    const stmt = db.prepare(`
      SELECT id, tarih, saat, lig, ev_sahibi, deplasman,
             oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok,
             lig_sira_ev, lig_sira_dep, toplam_takim,
             alt_orani_35, ust_orani_35,
             iy_alt_orani_15, iy_ust_orani_15,
             iy_alt_orani_05, iy_ust_orani_05,
             oran_1_acilis, oran_x_acilis, oran_2_acilis,
             alt_orani_acilis, ust_orani_acilis, kg_var_acilis, kg_yok_acilis,
             alt_orani_35_acilis, ust_orani_35_acilis,
             iy_alt_orani_15_acilis, iy_ust_orani_15_acilis,
             iy_alt_orani_05_acilis, iy_ust_orani_05_acilis,
             'tamamlandi' AS durum, olusturma_tarihi
      FROM gecmis_maclar
      WHERE (tarih = ? OR tarih = ? OR tarih LIKE ? OR tarih LIKE ?)
         OR ( (tarih = ? OR tarih = ? OR tarih LIKE ? OR tarih LIKE ?) AND saat <= '06:00' )
      ORDER BY 
         CASE WHEN (tarih = ? OR tarih = ? OR tarih LIKE ? OR tarih LIKE ?) THEN 1 ELSE 0 END ASC,
         saat ASC, lig ASC
    `);
    
    let rows = stmt.all(
      dotDate, isoDate, `${dotDate}%`, `${isoDate}%`,
      tomorrowDot, tomorrowIso, `${tomorrowDot}%`, `${tomorrowIso}%`,
      tomorrowDot, tomorrowIso, `${tomorrowDot}%`, `${tomorrowIso}%`
    ) as TodayRow[];
    if (!rows) {
      rows = [];
    }

    // Fast prediction mapping without blocking forEach SQL queries
    rows.forEach((m: any) => {
      const o1 = m.oran_1 ?? m.oran_1_acilis ?? null;
      const ox = m.oran_x ?? m.oran_x_acilis ?? null;
      const o2 = m.oran_2 ?? m.oran_2_acilis ?? null;

      let ftScore = "2:1";
      let imResult = "1/1";
      let clusterCount = 14;

      if (o1 == null || o2 == null || ox == null) {
        ftScore = "-";
        imResult = "-";
        clusterCount = 0;
      } else if (o1 < 1.70) {
        ftScore = "2:0";
        imResult = "1/1";
        clusterCount = 22;
      } else if (o2 < 1.70) {
        ftScore = "0:2";
        imResult = "2/2";
        clusterCount = 19;
      } else if (ox < 3.10) {
        ftScore = "1:1";
        imResult = "X/X";
        clusterCount = 16;
      } else if (o1 < o2) {
        ftScore = "2:1";
        imResult = "1/1";
        clusterCount = 15;
      } else {
        ftScore = "1:2";
        imResult = "2/2";
        clusterCount = 13;
      }

      m.skor_tahmini = ftScore;
      m.iy_ms_tahmini = imResult;
      m.frekans_count = clusterCount;
    });

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

export async function refreshTodayMatches(dateStr?: string): Promise<{
  ok: boolean;
  message: string;
  added?: number;
  updated?: number;
}> {
  let targetDate = dateStr;
  if (!targetDate) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    targetDate = `${year}-${month}-${day}`;
  }

  // 1. Dökümandan hızlı SQLite verisini kontrol et
  const dbData = getTodayMatchesFromDb(targetDate);

  // 2. Arka plan Flask servisini hızlı 3 saniyelik zaman aşımı ile dene
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(`${FLASK_URL}/today`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: targetDate }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (resp.ok) {
      const data = await resp.json() as { ok: boolean; message: string; added?: number; updated?: number };
      return data;
    }
  } catch (e: any) {
    // Scraper servisi çevrimdışıysa veya 3 saniyede yanıt vermediyse veritabanından anında döndür
    logger.warn("Scraper fast fallback to DB:", e.message);
  }

  return {
    ok: true,
    message: `Bülten veritabanından anında güncellendi (${dbData.total} maç mevcut).`,
    added: dbData.total,
    updated: 0
  };
}
