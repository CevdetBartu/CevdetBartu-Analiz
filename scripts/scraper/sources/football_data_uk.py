"""
football-data.co.uk CSV kaynağı.

Her lig × sezon kombinasyonu için tek bir CSV dosyası indirilir.
CSV içinde: tarih, ev/deplasman, FT/HT skor, sarı/kırmızı kartlar, Bet365 oranları.
"""

import csv
import io
import datetime
import logging
import requests
from typing import Optional

from config import FDUK_BASE, DELAY_MIN, DELAY_MAX, MAX_RETRIES
import time
import random

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Yardımcılar
# ──────────────────────────────────────────────────────────────────────────────

def _safe_float(val: str) -> Optional[float]:
    """Boş veya hatalı değerleri None yap."""
    if not val or val.strip() in ("", "N/A", "NA", "#N/A", "#VALUE!"):
        return None
    try:
        v = float(val.strip())
        return v if v > 0 else None
    except ValueError:
        return None


import math

def _solve_T(p_under: float) -> float:
    low, high = 0.0, 10.0
    for _ in range(25):
        mid = (low + high) / 2
        p = math.exp(-mid) * (1 + mid + (mid**2) / 2)
        if p > p_under:
            low = mid
        else:
            high = mid
    return (low + high) / 2

def _estimate_btts(o1: float | None, ox: float | None, o2: float | None, o_under: float | None, o_over: float | None) -> tuple[Optional[float], Optional[float]]:
    if not all([o1, ox, o2, o_under, o_over]):
        return None, None
    try:
        sum_1x2 = 1/o1 + 1/ox + 1/o2
        p_home = (1/o1) / sum_1x2
        p_away = (1/o2) / sum_1x2
        p_under = (1/o_under) / (1/o_under + 1/o_over)
        
        T = _solve_T(p_under)
        ratio = math.sqrt(p_home / p_away) if p_away > 0 else 1.0
        l2 = T / (ratio + 1)
        l1 = T - l2
        
        p_btts_yes = (1 - math.exp(-l1)) * (1 - math.exp(-l2))
        p_btts_yes += 0.06
        p_btts_yes = max(0.15, min(0.85, p_btts_yes))
        p_btts_no = 1.0 - p_btts_yes
        
        margin = 1.03
        kg_var = round(margin / p_btts_yes, 2)
        kg_yok = round(margin / p_btts_no, 2)
        return kg_var, kg_yok
    except Exception:
        return None, None


def _parse_date(raw: str) -> Optional[str]:
    """
    dd/mm/yy veya dd/mm/yyyy → "dd.mm.yyyy"
    """
    raw = raw.strip()
    for fmt in ("%d/%m/%y", "%d/%m/%Y"):
        try:
            d = datetime.datetime.strptime(raw, fmt)
            return d.strftime("%d.%m.%Y")
        except ValueError:
            pass
    return None


def current_and_past_seasons(n: int) -> list[str]:
    """
    Tamamlanmış veya büyük ölçüde tamamlanmış en güncel sezonu ve
    n-1 önceki sezonu döndür.
    Format: "2425" (2024/25 sezonu için)

    Ligler genellikle Ağustos'ta başlar. Temmuz'da henüz yeni sezon
    başlamadığından, geçen yılın sezonu mevcut sezon kabul edilir.
    """
    today = datetime.date.today()
    # Ağustos veya sonrası → yeni sezon başlamış
    # Temmuz veya öncesi   → geçen sezon hâlâ en güncel
    season_start_year = today.year if today.month >= 8 else today.year - 1
    seasons = []
    for i in range(n):
        y1 = season_start_year - i
        y2 = y1 + 1
        seasons.append(f"{str(y1)[2:]}{str(y2)[2:]}")
    return seasons


# ──────────────────────────────────────────────────────────────────────────────
# CSV indirme
# ──────────────────────────────────────────────────────────────────────────────

def download_csv(league_code: str, season: str) -> Optional[str]:
    """
    Verilen lig+sezon CSV'sini indir, metin olarak döndür.
    Örnek: download_csv("T1", "2425")
    """
    url = f"{FDUK_BASE}/{season}/{league_code}.csv"
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, timeout=30, headers={
                "User-Agent": "Mozilla/5.0 (compatible; football-stats-bot/1.0)",
            })
            if resp.status_code == 200:
                logger.debug(f"İndirildi: {url} ({len(resp.content)} bayt)")
                return resp.text
            elif resp.status_code == 404:
                logger.debug(f"Bulunamadı (404): {url}")
                return None
            else:
                logger.warning(f"[{resp.status_code}] {url} → deneme {attempt}/{MAX_RETRIES}")
                if attempt < MAX_RETRIES:
                    time.sleep(random.uniform(2, 5))
        except requests.exceptions.RequestException as e:
            logger.error(f"İndirme hatası: {e} — {url}")
            if attempt < MAX_RETRIES:
                time.sleep(random.uniform(2, 5))
    return None


# ──────────────────────────────────────────────────────────────────────────────
# CSV ayrıştırma
# ──────────────────────────────────────────────────────────────────────────────

def parse_csv(
    csv_text: str,
    league_name: str,
    league_code: str,
    season: str,
    after_date: Optional[datetime.date] = None,
) -> list[dict]:
    """
    CSV metnini gecmis_maclar satırlarına dönüştür.
    after_date verilirse bu tarihten önceki maçlar atlanır.
    """
    rows = []
    reader = csv.DictReader(io.StringIO(csv_text))

    for raw in reader:
        row = _parse_row(raw, league_name, league_code, season)
        if row is None:
            continue
        if after_date is not None:
            try:
                rd = datetime.datetime.strptime(row["tarih"], "%d.%m.%Y").date()
                if rd < after_date:
                    continue
            except ValueError:
                pass
        rows.append(row)

    return rows


def _parse_row(
    raw: dict,
    league_name: str,
    league_code: str,
    season: str,
) -> Optional[dict]:
    """Tek bir CSV satırını dict'e çevir. Eksik kritik alan → None."""

    # ── Takımlar ──
    home = (raw.get("HomeTeam") or "").strip()
    away = (raw.get("AwayTeam") or "").strip()
    if not home or not away:
        return None

    # ── Tarih ──
    tarih = _parse_date(raw.get("Date") or "")
    if not tarih:
        return None

    # ── Skor ──
    fthg = raw.get("FTHG") or raw.get("HG") or ""
    ftag = raw.get("FTAG") or raw.get("AG") or ""
    hthg = raw.get("HTHG") or ""
    htag = raw.get("HTAG") or ""

    try:
        fthg_i = int(fthg.strip())
        ftag_i = int(ftag.strip())
    except (ValueError, AttributeError):
        return None  # Oynanmamış / iptal maç

    mac_skoru = f"{fthg_i}:{ftag_i}"

    devre_skoru = None
    try:
        devre_skoru = f"{int(hthg.strip())}:{int(htag.strip())}"
    except (ValueError, AttributeError):
        pass

    # ── Saat ──
    saat = (raw.get("Time") or "").strip() or None

    # ── Kartlar ──
    hy = raw.get("HY") or ""   # Home Yellow
    ay = raw.get("AY") or ""   # Away Yellow
    hr = raw.get("HR") or ""   # Home Red
    ar = raw.get("AR") or ""   # Away Red

    def _int(s: str) -> Optional[int]:
        try:
            return int(s.strip())
        except (ValueError, AttributeError):
            return None

    kart_ev  = _int(hy)
    kart_dep = _int(ay)
    kr_h = _int(hr) or 0
    kr_a = _int(ar) or 0
    kirmizi_kart = kr_h + kr_a if (kr_h + kr_a) > 0 else None

    # ── Korner ──
    korner_ev  = _int(raw.get("HC") or "")   # Home Corners
    korner_dep = _int(raw.get("AC") or "")   # Away Corners

    # ── İlk Yarı / Maç Sonu (HT/FT) Sonucu ──
    try:
        ht_h2 = int(hthg.strip())
        ht_a2 = int(htag.strip())
        _ht = "1" if ht_h2 > ht_a2 else ("2" if ht_h2 < ht_a2 else "X")
        _ft = "1" if fthg_i > ftag_i else ("2" if fthg_i < ftag_i else "X")
        im_6 = f"{_ht}/{_ft}"
    except (ValueError, AttributeError):
        im_6 = None

    # ── 1X2 Oranları ──
    # Kapanış oranları (C harfli sütunlar öncelikli, yoksa açılış sütunları)
    oran_1 = _safe_float(raw.get("B365CH") or raw.get("B365H") or raw.get("AvgCH") or raw.get("AvgH") or "")
    oran_x = _safe_float(raw.get("B365CD") or raw.get("B365D") or raw.get("AvgCD") or raw.get("AvgD") or "")
    oran_2 = _safe_float(raw.get("B365CA") or raw.get("B365A") or raw.get("AvgCA") or raw.get("AvgA") or "")

    # Açılış oranları
    oran_1_acilis = _safe_float(raw.get("B365H") or raw.get("AvgH") or "")
    oran_x_acilis = _safe_float(raw.get("B365D") or raw.get("AvgD") or "")
    oran_2_acilis = _safe_float(raw.get("B365A") or raw.get("AvgA") or "")

    # ── Alt/Üst 2.5 Oranları ──
    ust_orani = _safe_float(raw.get("B365C>2.5") or raw.get("B365>2.5") or raw.get("AvgC>2.5") or raw.get("Avg>2.5") or "")
    alt_orani = _safe_float(raw.get("B365C<2.5") or raw.get("B365<2.5") or raw.get("AvgC<2.5") or raw.get("Avg<2.5") or "")

    ust_orani_acilis = _safe_float(raw.get("B365>2.5") or raw.get("Avg>2.5") or "")
    alt_orani_acilis = _safe_float(raw.get("B365<2.5") or raw.get("Avg<2.5") or "")

    # Fallback
    if not oran_1_acilis: oran_1_acilis = oran_1
    if not oran_x_acilis: oran_x_acilis = oran_x
    if not oran_2_acilis: oran_2_acilis = oran_2
    if not ust_orani_acilis: ust_orani_acilis = ust_orani
    if not alt_orani_acilis: alt_orani_acilis = alt_orani

    # ── KG Var/Yok ──
    kg_var, kg_yok = _estimate_btts(oran_1, oran_x, oran_2, alt_orani, ust_orani)
    kg_var_acilis, kg_yok_acilis = _estimate_btts(oran_1_acilis, oran_x_acilis, oran_2_acilis, alt_orani_acilis, ust_orani_acilis)

    # ── Ortalama min/max ──
    avg_h = _safe_float(raw.get("AvgH") or "")
    avg_d = _safe_float(raw.get("AvgD") or "")
    avg_a = _safe_float(raw.get("AvgA") or "")
    vals = [v for v in [avg_h, avg_d, avg_a] if v is not None and v > 1]
    ort_min = round(min(vals), 2) if vals else None
    ort_max = round(max(vals), 2) if vals else None

    # ── Kaynak ID ──
    kaynak_id_str = f"fduk_{league_code}_{season}_{tarih.replace('.', '')}_{home}_{away}"
    kaynak_id_str = kaynak_id_str[:200]

    return {
        "tarih":            tarih,
        "saat":             saat,
        "lig":              league_name,
        "ev_sahibi":        home,
        "deplasman":        away,
        "devre_skoru":      devre_skoru,
        "mac_skoru":        mac_skoru,
        "onceki_skorlar":   None,
        "kart_ev":          kart_ev,
        "kart_dep":         kart_dep,
        "kirmizi_kart":     kirmizi_kart,
        "lig_sira_ev":      None,
        "lig_sira_dep":     None,
        "toplam_takim":     None,
        "korner_ev":        korner_ev,
        "korner_dep":       korner_dep,
        "im_6":             im_6,
        "oran_1":           oran_1,
        "oran_x":           oran_x,
        "oran_2":           oran_2,
        "alt_orani":        alt_orani,
        "ust_orani":        ust_orani,
        "kg_var":           kg_var,
        "kg_yok":           kg_yok,
        "ort_min":          ort_min,
        "ort_max":          ort_max,
        "oran_1_acilis":    oran_1_acilis,
        "oran_x_acilis":    oran_x_acilis,
        "oran_2_acilis":    oran_2_acilis,
        "alt_orani_acilis": alt_orani_acilis,
        "ust_orani_acilis": ust_orani_acilis,
        "kg_var_acilis":    kg_var_acilis,
        "kg_yok_acilis":    kg_yok_acilis,
        "kaynak":           "football-data.co.uk",
        "kaynak_id":        kaynak_id_str,
    }
