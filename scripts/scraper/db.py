"""
SQLite veritabanı yönetimi.
Tablo: gecmis_maclar — tüm geçmiş maç verileri
Tablo: scraper_state — hangi tarihler işlendi, durum takibi
"""

import sqlite3
import os
import json
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
                oran_1_acilis    REAL,
                oran_x_acilis    REAL,
                oran_2_acilis    REAL,
                alt_orani_acilis REAL,
                ust_orani_acilis REAL,
                kg_var_acilis    REAL,
                kg_yok_acilis    REAL,
                alt_orani_35        REAL,          -- 3.5 Altı
                ust_orani_35        REAL,          -- 3.5 Üstü
                alt_orani_35_acilis REAL,
                ust_orani_35_acilis REAL,
                iy_alt_orani_15        REAL,          -- İlk Yarı 1.5 Altı
                iy_ust_orani_15        REAL,          -- İlk Yarı 1.5 Üstü
                iy_alt_orani_15_acilis REAL,
                iy_ust_orani_15_acilis REAL,
                iy_alt_orani_05        REAL,          -- İlk Yarı 0.5 Altı
                iy_ust_orani_05        REAL,          -- İlk Yarı 0.5 Üstü
                iy_alt_orani_05_acilis REAL,
                iy_ust_orani_05_acilis REAL,
                kaynak           TEXT DEFAULT 'sofascore',
                kaynak_id        INTEGER,       -- SofaScore event ID
                olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ev_sahibi, deplasman, tarih)
            )
        """)

        # Eski tablolara yeni kolonları ekle (varsaOperationalError fırlatır, yakala)
        cols = [
            ("oran_1_acilis", "REAL"),
            ("oran_x_acilis", "REAL"),
            ("oran_2_acilis", "REAL"),
            ("alt_orani_acilis", "REAL"),
            ("ust_orani_acilis", "REAL"),
            ("kg_var_acilis", "REAL"),
            ("kg_yok_acilis", "REAL"),
            ("alt_orani_35", "REAL"),
            ("ust_orani_35", "REAL"),
            ("alt_orani_35_acilis", "REAL"),
            ("ust_orani_35_acilis", "REAL"),
            ("iy_alt_orani_15", "REAL"),
            ("iy_ust_orani_15", "REAL"),
            ("iy_alt_orani_15_acilis", "REAL"),
            ("iy_ust_orani_15_acilis", "REAL"),
            ("iy_alt_orani_05", "REAL"),
            ("iy_ust_orani_05", "REAL"),
            ("iy_alt_orani_05_acilis", "REAL"),
            ("iy_ust_orani_05_acilis", "REAL"),
            ("kita", "TEXT"),
            ("lig_seviyesi", "TEXT"),
            ("teknik_direktor_ev", "TEXT"),
            ("teknik_direktor_dep", "TEXT"),
            ("hakem", "TEXT"),
            ("stadyum", "TEXT"),
        ]
        for name, dtype in cols:
            try:
                conn.execute(f"ALTER TABLE gecmis_maclar ADD COLUMN {name} {dtype}")
            except sqlite3.OperationalError:
                pass

        # ── Hız indeksleri ───────────────────────────────────────────────
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_oran_1     ON gecmis_maclar(oran_1)",
            "CREATE INDEX IF NOT EXISTS idx_oran_x     ON gecmis_maclar(oran_x)",
            "CREATE INDEX IF NOT EXISTS idx_oran_2     ON gecmis_maclar(oran_2)",
            "CREATE INDEX IF NOT EXISTS idx_alt_orani  ON gecmis_maclar(alt_orani)",
            "CREATE INDEX IF NOT EXISTS idx_ust_orani  ON gecmis_maclar(ust_orani)",
            "CREATE INDEX IF NOT EXISTS idx_kg_var     ON gecmis_maclar(kg_var)",
            "CREATE INDEX IF NOT EXISTS idx_kg_yok     ON gecmis_maclar(kg_yok)",
            "CREATE INDEX IF NOT EXISTS idx_oran_1_acilis ON gecmis_maclar(oran_1_acilis)",
            "CREATE INDEX IF NOT EXISTS idx_oran_x_acilis ON gecmis_maclar(oran_x_acilis)",
            "CREATE INDEX IF NOT EXISTS idx_oran_2_acilis ON gecmis_maclar(oran_2_acilis)",
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


def upsert_match(row: dict, conn=None) -> bool:
    """Maç kaydını ekle veya varsa güncelle. True=eklendi/güncellendi."""
    sql = """
        INSERT INTO gecmis_maclar
            (tarih, saat, lig, ev_sahibi, deplasman,
             devre_skoru, mac_skoru, onceki_skorlar,
             kart_ev, kart_dep, kirmizi_kart, korner_ev, korner_dep,
             lig_sira_ev, lig_sira_dep, toplam_takim, im_6,
             oran_1, oran_x, oran_2,
             alt_orani, ust_orani, kg_var, kg_yok,
             ort_min, ort_max,
             oran_1_acilis, oran_x_acilis, oran_2_acilis,
             alt_orani_acilis, ust_orani_acilis, kg_var_acilis, kg_yok_acilis,
             alt_orani_35, ust_orani_35, alt_orani_35_acilis, ust_orani_35_acilis,
             iy_alt_orani_15, iy_ust_orani_15, iy_alt_orani_15_acilis, iy_ust_orani_15_acilis,
             iy_alt_orani_05, iy_ust_orani_05, iy_alt_orani_05_acilis, iy_ust_orani_05_acilis,
             kaynak, kaynak_id,
             kita, lig_seviyesi, teknik_direktor_ev, teknik_direktor_dep, hakem, stadyum)
        VALUES
            (:tarih, :saat, :lig, :ev_sahibi, :deplasman,
             :devre_skoru, :mac_skoru, :onceki_skorlar,
             :kart_ev, :kart_dep, :kirmizi_kart, :korner_ev, :korner_dep,
             :lig_sira_ev, :lig_sira_dep, :toplam_takim, :im_6,
             :oran_1, :oran_x, :oran_2,
             :alt_orani, :ust_orani, :kg_var, :kg_yok,
             :ort_min, :ort_max,
             :oran_1_acilis, :oran_x_acilis, :oran_2_acilis,
             :alt_orani_acilis, :ust_orani_acilis, :kg_var_acilis, :kg_yok_acilis,
             :alt_orani_35, :ust_orani_35, :alt_orani_35_acilis, :ust_orani_35_acilis,
             :iy_alt_orani_15, :iy_ust_orani_15, :iy_alt_orani_15_acilis, :iy_ust_orani_15_acilis,
             :iy_alt_orani_05, :iy_ust_orani_05, :iy_alt_orani_05_acilis, :iy_ust_orani_05_acilis,
             :kaynak, :kaynak_id,
             :kita, :lig_seviyesi, :teknik_direktor_ev, :teknik_direktor_dep, :hakem, :stadyum)
        ON CONFLICT(ev_sahibi, deplasman, tarih) DO UPDATE SET
            devre_skoru = COALESCE(excluded.devre_skoru, devre_skoru),
            mac_skoru = CASE WHEN excluded.mac_skoru != '?:?' THEN excluded.mac_skoru ELSE mac_skoru END,
            kart_ev = COALESCE(excluded.kart_ev, kart_ev),
            kart_dep = COALESCE(excluded.kart_dep, kart_dep),
            kirmizi_kart = COALESCE(excluded.kirmizi_kart, kirmizi_kart),
            korner_ev = COALESCE(excluded.korner_ev, korner_ev),
            korner_dep = COALESCE(excluded.korner_dep, korner_dep),
            lig_sira_ev = COALESCE(excluded.lig_sira_ev, lig_sira_ev),
            lig_sira_dep = COALESCE(excluded.lig_sira_dep, lig_sira_dep),
            toplam_takim = COALESCE(excluded.toplam_takim, toplam_takim),
            oran_1 = COALESCE(excluded.oran_1, oran_1),
            oran_x = COALESCE(excluded.oran_x, oran_x),
            oran_2 = COALESCE(excluded.oran_2, oran_2),
            alt_orani = COALESCE(excluded.alt_orani, alt_orani),
            ust_orani = COALESCE(excluded.ust_orani, ust_orani),
            kg_var = COALESCE(excluded.kg_var, kg_var),
            kg_yok = COALESCE(excluded.kg_yok, kg_yok),
            oran_1_acilis = COALESCE(excluded.oran_1_acilis, oran_1_acilis),
            oran_x_acilis = COALESCE(excluded.oran_x_acilis, oran_x_acilis),
            oran_2_acilis = COALESCE(excluded.oran_2_acilis, oran_2_acilis),
            alt_orani_acilis = COALESCE(excluded.alt_orani_acilis, alt_orani_acilis),
            ust_orani_acilis = COALESCE(excluded.ust_orani_acilis, ust_orani_acilis),
            kg_var_acilis = COALESCE(excluded.kg_var_acilis, kg_var_acilis),
            kg_yok_acilis = COALESCE(excluded.kg_yok_acilis, kg_yok_acilis),
            alt_orani_35 = COALESCE(excluded.alt_orani_35, alt_orani_35),
            ust_orani_35 = COALESCE(excluded.ust_orani_35, ust_orani_35),
            alt_orani_35_acilis = COALESCE(excluded.alt_orani_35_acilis, alt_orani_35_acilis),
            ust_orani_35_acilis = COALESCE(excluded.ust_orani_35_acilis, ust_orani_35_acilis),
            iy_alt_orani_15 = COALESCE(excluded.iy_alt_orani_15, iy_alt_orani_15),
            iy_ust_orani_15 = COALESCE(excluded.iy_ust_orani_15, iy_ust_orani_15),
            iy_alt_orani_15_acilis = COALESCE(excluded.iy_alt_orani_15_acilis, iy_alt_orani_15_acilis),
            iy_ust_orani_15_acilis = COALESCE(excluded.iy_ust_orani_15_acilis, iy_ust_orani_15_acilis),
            iy_alt_orani_05 = COALESCE(excluded.iy_alt_orani_05, iy_alt_orani_05),
            iy_ust_orani_05 = COALESCE(excluded.iy_ust_orani_05, iy_ust_orani_05),
            iy_alt_orani_05_acilis = COALESCE(excluded.iy_alt_orani_05_acilis, iy_alt_orani_05_acilis),
            iy_ust_orani_05_acilis = COALESCE(excluded.iy_ust_orani_05_acilis, iy_ust_orani_05_acilis),
            im_6 = COALESCE(excluded.im_6, im_6),
            kita = COALESCE(excluded.kita, kita),
            lig_seviyesi = COALESCE(excluded.lig_seviyesi, lig_seviyesi),
            teknik_direktor_ev = COALESCE(excluded.teknik_direktor_ev, teknik_direktor_ev),
            teknik_direktor_dep = COALESCE(excluded.teknik_direktor_dep, teknik_direktor_dep),
            hakem = COALESCE(excluded.hakem, hakem),
            stadyum = COALESCE(excluded.stadyum, stadyum)
    """
    
    # Yeni eklenecek key'ler row içinde yoksa None olarak verelim (Geriye dönük uyumluluk)
    for key in ['kita', 'lig_seviyesi', 'teknik_direktor_ev', 'teknik_direktor_dep', 'hakem', 'stadyum']:
        if key not in row:
            row[key] = None

    my_conn = conn if conn else get_conn()
    try:
        cur = my_conn.execute(sql, row)
        if not conn:
            my_conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        logger.error(f"upsert_match hatası: {e}")
        return False
    finally:
        if not conn:
            my_conn.close()


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

        # Check user custom configured start date from custom_settings.json
        custom_start = get_custom_setting("custom_start_date")
        en_eski_final = custom_start if custom_start else oldest

        with_odds = conn.execute(
            "SELECT COUNT(*) FROM gecmis_maclar WHERE oran_1 IS NOT NULL"
        ).fetchone()[0]

        return {
            "total_mac":  total,
            "oranli_mac": with_odds,
            "en_eski":    en_eski_final,
            "en_eski_db": oldest,
            "en_yeni":    newest,
            "custom_start_date": custom_start,
            "ligler":     [{"lig": r["lig"], "mac": r["n"]} for r in by_league],
        }
    finally:
        conn.close()


def get_state(key: str, default: Optional[str] = None) -> Optional[str]:
    conn = get_conn()
    try:
        cur = conn.execute("SELECT value FROM scraper_state WHERE key = ?", (key,))
        row = cur.fetchone()
        return row[0] if row else default
    except Exception:
        return default
    finally:
        conn.close()

def set_state(key: str, value: str) -> None:
    conn = get_conn()
    try:
        conn.execute("INSERT OR REPLACE INTO scraper_state (key, value) VALUES (?, ?)", (key, value))
        conn.commit()
    except Exception as e:
        logger.error(f"set_state error: {e}")
    finally:
        conn.close()


SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "custom_settings.json")

def get_custom_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get(key, default)
        except Exception:
            pass
    return default

def set_custom_setting(key: str, value: str) -> None:
    data = {}
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    data[key] = value
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Error saving custom setting: {e}")


def clean_zero_odds_leagues(conn=None) -> int:
    """
    Sıfır Oranlı Lig Filtresi:
    Hiçbir maçında oran verisi (oran_1, oran_x, oran_2, oran_1_acilis, alt_orani)
    olmayan ligleri veritabanından tamamen siler.
    Ancak en az 1 maçında bile oran olan liglere dokunmaz.
    Döndürür: Silinen maç sayısı.
    """
    import time
    sql = """
        DELETE FROM gecmis_maclar
        WHERE lig IN (
            SELECT lig
            FROM gecmis_maclar
            GROUP BY lig
            HAVING COUNT(oran_1) = 0
               AND COUNT(oran_x) = 0
               AND COUNT(oran_2) = 0
               AND COUNT(oran_1_acilis) = 0
               AND COUNT(alt_orani) = 0
        )
    """
    for attempt in range(5):
        my_conn = conn if conn else get_conn()
        try:
            cur = my_conn.execute(sql)
            deleted_count = cur.rowcount
            if not conn:
                my_conn.commit()
            if deleted_count > 0:
                logger.info(f"Sıfır oranlı lig filtresi uygulandı: {deleted_count} maç veritabanından temizlendi.")
            return deleted_count
        except sqlite3.OperationalError as e:
            if "locked" in str(e).lower() and attempt < 4:
                time.sleep(1.5)
                continue
            logger.error(f"clean_zero_odds_leagues hatası: {e}")
            return 0
        except Exception as e:
            logger.error(f"clean_zero_odds_leagues hatası: {e}")
            return 0
        finally:
            if not conn:
                my_conn.close()
    return 0

