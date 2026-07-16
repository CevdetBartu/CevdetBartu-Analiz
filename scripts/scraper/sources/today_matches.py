"""
Bugünün maçlarını SofaScore'dan çeker — sadece oranlar, skorsuz.
Mevcut gecmis_maclar tablosunu kullanır.
"""
from __future__ import annotations

import datetime
import logging
from typing import Optional

import requests

from ..sessions import get_session
from ..db import upsert_match

logger = logging.getLogger(__name__)

_BASE = "https://api.sofascore.com/api/v1"
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.sofascore.com/",
}

# ─── Market IDs ───────────────────────────────────────────────────────────────
MARKET_1X2   = 1
MARKET_OU    = 18   # Over/Under 2.5
MARKET_BTTS  = 29   # Both Teams To Score


def _get(path: str) -> Optional[dict]:
    sess = get_session()
    try:
        resp = sess.get(f"{_BASE}{path}", headers=_HEADERS, timeout=12)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning("SofaScore GET %s → %s", path, e)
        return None


def _frac_to_dec(frac: str | None) -> Optional[float]:
    if not frac:
        return None
    try:
        if "/" in frac:
            num, den = frac.split("/")
            return round(int(num) / int(den) + 1, 2)
        return float(frac)
    except Exception:
        return None


def _get_event_odds(event_id: int, market_id: int) -> list[dict]:
    data = _get(f"/event/{event_id}/odds/{market_id}/all")
    if not data:
        return []
    return data.get("choices", [])


def _parse_1x2(choices: list[dict]) -> dict:
    result: dict = {}
    for c in choices:
        name = c.get("name", "").strip().lower()
        val  = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
        if name == "1":
            result["oran_1"] = round(float(val), 2) if val else None
        elif name == "x":
            result["oran_x"] = round(float(val), 2) if val else None
        elif name == "2":
            result["oran_2"] = round(float(val), 2) if val else None
    return result


def _parse_ou(choices: list[dict]) -> dict:
    """Over/Under 2.5 oranları."""
    for c in choices:
        name = c.get("name", "").lower()
        val  = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
        if "over" in name:
            return {"ust_orani": round(float(val), 2) if val else None}
        elif "under" in name:
            return {"alt_orani": round(float(val), 2) if val else None}
    # İkinci geçiş
    alt = ust = None
    for c in choices:
        name = c.get("name", "").lower()
        val  = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
        fval = round(float(val), 2) if val else None
        if any(k in name for k in ("over", "ust", "üst", "2.5")):
            ust = fval
        elif any(k in name for k in ("under", "alt", "2.5")):
            alt = fval
    return {"alt_orani": alt, "ust_orani": ust}


def _parse_btts(choices: list[dict]) -> dict:
    result: dict = {"kg_var": None, "kg_yok": None}
    for c in choices:
        name = c.get("name", "").lower()
        val  = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
        fval = round(float(val), 2) if val else None
        if name in ("yes", "var", "evet"):
            result["kg_var"] = fval
        elif name in ("no", "yok", "hayır"):
            result["kg_yok"] = fval
    return result


def _calc_avg_odds(o1, ox, o2) -> tuple[Optional[float], Optional[float]]:
    vals = [v for v in [o1, ox, o2] if v]
    if not vals:
        return None, None
    return round(min(vals), 2), round(max(vals), 2)


def fetch_today_events(target_date: Optional[datetime.date] = None) -> list[dict]:
    """
    Belirtilen tarihin maçlarını SofaScore'dan çeker.
    target_date: None ise bugün.
    """
    if target_date is None:
        target_date = datetime.date.today()

    date_str = target_date.strftime("%Y-%m-%d")
    logger.info("today_matches: %s için maçlar çekiliyor", date_str)

    data = _get(f"/sport/football/scheduled-events/{date_str}")
    if not data:
        return []

    events = data.get("events", [])
    logger.info("today_matches: %d etkinlik bulundu", len(events))

    rows = []
    for event in events:
        eid   = event.get("id")
        if not eid:
            continue

        league_info = event.get("tournament", {}).get("category", {})
        league_name = event.get("tournament", {}).get("name", "")
        country     = league_info.get("name", "")
        full_league = f"{country} - {league_name}" if country else league_name

        home = event.get("homeTeam", {}).get("name", "").strip()
        away = event.get("awayTeam", {}).get("name", "").strip()
        if not home or not away:
            continue

        ts = event.get("startTimestamp", 0)
        dt = datetime.datetime.utcfromtimestamp(ts) + datetime.timedelta(hours=3)
        tarih = dt.strftime("%d.%m.%Y")
        saat  = dt.strftime("%H:%M")

        # Oranları çek
        c_1x2  = _get_event_odds(eid, MARKET_1X2)
        c_ou   = _get_event_odds(eid, MARKET_OU)
        c_btts = _get_event_odds(eid, MARKET_BTTS)

        o1x2 = _parse_1x2(c_1x2)
        ou   = _parse_ou(c_ou)
        btts = _parse_btts(c_btts)

        oran_1 = o1x2.get("oran_1")
        oran_x = o1x2.get("oran_x")
        oran_2 = o1x2.get("oran_2")
        ort_min, ort_max = _calc_avg_odds(oran_1, oran_x, oran_2)

        row = {
            "tarih":          tarih,
            "saat":           saat,
            "lig":            full_league,
            "ev_sahibi":      home,
            "deplasman":      away,
            "devre_skoru":    None,
            "mac_skoru":      "?:?",   # Henüz oynanmadı
            "onceki_skorlar": None,
            "kart_ev":        None,
            "kart_dep":       None,
            "kirmizi_kart":   0,
            "lig_sira_ev":    None,
            "lig_sira_dep":   None,
            "toplam_takim":   None,
            "im_6":           None,
            "oran_1":         oran_1,
            "oran_x":         oran_x,
            "oran_2":         oran_2,
            "alt_orani":      ou.get("alt_orani"),
            "ust_orani":      ou.get("ust_orani"),
            "kg_var":         btts.get("kg_var"),
            "kg_yok":         btts.get("kg_yok"),
            "ort_min":        ort_min,
            "ort_max":        ort_max,
        }
        rows.append(row)

    logger.info("today_matches: %d satır hazır", len(rows))
    return rows


def run_today_scrape(target_date: Optional[datetime.date] = None, conn=None) -> dict:
    """
    Bugünün maçlarını çek ve DB'ye kaydet.
    Returns: {"ok": True, "added": N, "updated": M}
    """
    rows = fetch_today_events(target_date)
    if not rows:
        return {"ok": True, "added": 0, "updated": 0, "message": "Maç bulunamadı"}

    added = 0
    for row in rows:
        try:
            upsert_match(row, conn=conn)
            added += 1
        except Exception as e:
            logger.warning("today upsert hata: %s | %s", row.get("ev_sahibi"), e)

    return {"ok": True, "added": added, "updated": 0, "message": f"{added} maç güncellendi"}
