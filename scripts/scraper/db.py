"""
SQLite veritabanı yönetimi.
Tablo: gecmis_maclar — tüm geçmiş maç verileri
Tablo: scraper_state — hangi tarihler işlendi, durum takibi
"""

import sqlite3
import logging
from typing import Optional
from config import DB_PATH

logger = logging.getLogger(__name__)


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # Eşzamanlı okuma için
    conn.execute("PRAGMA synchronous=NORMAL")  # Hız/güvenlik dengesi
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Tabloları ve indeksleri oluştur (yoksa)."""
    conn = get_conn()
    try:
        # ── Ana maç tablosu ──────────────────────────────────────────────
        conn.execute("""
            CREATE TABLE IF NOT EXISTS gecmis_maclar (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                tarih            TEXT,          -- "28.05.2025" formatında
                saat             TEXT,          -- "21:00"
                lig              TEXT,          -- Lig adı
                ev_sahibi        TEXT NOT NULL,
                deplasman        TEXT NOT NULL,
                devre_skoru      TEXT,          -- "1:0"
                mac_skoru        TEXT,          -- "2:1"
                onceki_skorlar   TEXT,          -- Önceki karşılaşma sonuçları
                kart_ev          INTEGER,       -- Ev sahibi sarı kart
                kart_dep         INTEGER,       -- Deplasman sarı kart
                kirmizi_kart     INTEGER DEFAULT 0,
                korner_ev        INTEGER,       -- Ev sahibi korner sayısı
                korner_dep       INTEGER,       -- Deplasman korner sayısı
                lig_sira_ev      INTEGER,
                lig_sira_dep     INTEGER,
                toplam_takim     INTEGER DEFAULT 20,
                im_6             TEXT,          -- i/m 6+ sonucu
                oran_1           REAL,          -- Ev kazanır
                oran_x           REAL,          -- Beraberlik
                oran_2           REAL,          -- Deplasman kazanır
                alt_orani        REAL,          -- 2.5 Altı
                ust_orani        REAL,          -- 2.5 Üstü
                kg_var           REAL,          -- KG Var
                kg_yok           REAL,          -- KG Yok
                ort_min          REAL,          -- Ortalama minimum oran
                ort_max          REAL,          -- Ortalama maximum oran
                kaynak           TEXT DEFAULT 'sofascore',
                kaynak_id        INTEGER,       -- SofaScore event ID
                olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ev_sahibi, deplasman, tarih)
            )
        """)

        # ── Hız indeksleri ───────────────────────────────────────────────
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_oran_1     ON gecmis_maclar(oran_1)",
            "CREATE INDEX IF NOT EXISTS idx_oran_x     ON gecmis_maclar(oran_x)",
            "CREATE INDEX IF NOT EXISTS idx_oran_2     ON gecmis_maclar(oran_2)",
            "CREATE INDEX IF NOT EXISTS idx_alt_orani  ON gecmis_maclar(alt_orani)",
            "CREATE INDEX IF NOT EXISTS idx_ust_orani  ON gecmis_maclar(ust_orani)",
            "CREATE INDEX IF NOT EXISTS idx_kg_var     ON gecmis_maclar(kg_var)",
            "CREATE INDEX IF NOT EXISTS idx_kg_yok     ON gecmis_maclar(kg_yok)",
            "CREATE INDEX IF NOT EXISTS idx_lig        ON gecmis_maclar(lig)",
            "CREATE INDEX IF NOT EXISTS idx_tarih      ON gecmis_maclar(tarih)",
            "CREATE INDEX IF NOT EXISTS idx_kaynak_id  ON gecmis_maclar(kaynak_id)",
        ]
        for idx_sql in indices:
            conn.execute(idx_sql)

        # ── Scraper durum tablosu ─────────────────────────────────────────
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scraper_state (
                key   TEXT PRIMARY KEY,
                value TEXT
            )
        """)

        conn.commit()
        logger.info(f"Veritabanı hazır: {DB_PATH}")
    finally:
        conn.close()


def upsert_match(row: dict) -> bool:
    """Maç kaydını ekle. Zaten varsa (UNIQUE constraint) atla. True=eklendi."""
    sql = """
        INSERT OR IGNORE INTO gecmis_maclar
            (tarih, saat, lig, ev_sahibi, deplasman,
             devre_skoru, mac_skoru, onceki_skorlar,
             kart_ev, kart_dep, kirmizi_kart, korner_ev, korner_dep,
             lig_sira_ev, lig_sira_dep, toplam_takim, im_6,
             oran_1, oran_x, oran_2,
             alt_orani, ust_orani, kg_var, kg_yok,
             ort_min, ort_max, kaynak, kaynak_id)
        VALUES
            (:tarih, :saat, :lig, :ev_sahibi, :deplasman,
             :devre_skoru, :mac_skoru, :onceki_skorlar,
             :kart_ev, :kart_dep, :kirmizi_kart, :korner_ev, :korner_dep,
             :lig_sira_ev, :lig_sira_dep, :toplam_takim, :im_6,
             :oran_1, :oran_x, :oran_2,
             :alt_orani, :ust_orani, :kg_var, :kg_yok,
             :ort_min, :ort_max, :kaynak, :kaynak_id)
    """
    conn = get_conn()
    try:
        cur = conn.execute(sql, row)
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        logger.error(f"upsert_match hatası: {e}")
        return False
    finally:
        conn.close()


def get_stats() -> dict:
    """Veritabanı istatistiklerini döndür."""
    conn = get_conn()
    try:
        total     = conn.execute("SELECT COUNT(*) FROM gecmis_maclar").fetchone()[0]
        by_league = conn.execute(
            "SELECT lig, COUNT(*) as n FROM gecmis_maclar GROUP BY lig ORDER BY n DESC"
        ).fetchall()
        # "dd.mm.yyyy" → "yyyymmdd" çevirimi ile doğru sıralama
        _date_expr = "substr(tarih,7,4)||substr(tarih,4,2)||substr(tarih,1,2)"
        oldest = conn.execute(
            f"SELECT tarih FROM gecmis_maclar ORDER BY {_date_expr} ASC  LIMIT 1"
        ).fetchone()
        newest = conn.execute(
            f"SELECT tarih FROM gecmis_maclar ORDER BY {_date_expr} DESC LIMIT 1"
        ).fetchone()
        oldest = oldest[0] if oldest else None
        newest = newest[0] if newest else None
        with_odds = conn.execute(
            "SELECT COUNT(*) FROM gecmis_maclar WHERE oran_1 IS NOT NULL"
        ).fetchone()[0]

        return {
            "total_mac":  total,
            "oranli_mac": with_odds,
            "en_eski":    oldest,
            "en_yeni":    newest,
            "ligler":     [{"lig": r["lig"], "mac": r["n"]} for r in by_league],
        }
    finally:
        conn.close()


def get_state(key: str, default: Optional[str] = None) -> Optional[str]:
    conn = get_conn()
    try:
        row = conn.execute("SELECT value FROM scraper_state WHERE key=?", (key,)).fetchone()
        return row["value"] if row else default
    finally:
        conn.close()


def set_state(key: str, value: str) -> None:
    conn = get_conn()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO scraper_state (key, value) VALUES (?, ?)",
            (key, value)
        )
        conn.commit()
    finally:
        conn.close()
