"""
Bugünün maçlarını SofaScore'dan çeker — sadece oranlar, skorsuz.
Mevcut gecmis_maclar tablosunu kullanır.
"""
from __future__ import annotations

import datetime
import logging
from typing import Optional

import requests

from sessions import safe_get
from db import upsert_match
from sources.sofascore import get_event_incidents, parse_cards
from config import SOFASCORE_TOURNAMENTS

logger = logging.getLogger(__name__)

_BASE = "https://api.sofascore.com/api/v1"

# ─── Market IDs ───────────────────────────────────────────────────────────────
MARKET_1X2   = 1
MARKET_OU    = 18   # Over/Under 2.5
MARKET_BTTS  = 29   # Both Teams To Score


def get_event_corners(event_id: int) -> tuple[Optional[int], Optional[int]]:
    """Fetch corners from SofaScore event statistics endpoint."""
    url = f"https://api.sofascore.com/api/v1/event/{event_id}/statistics"
    data = safe_get(url, is_sub=True)
    if not data:
        return None, None
    
    stats_list = data.get("statistics", [])
    for period_stats in stats_list:
        if period_stats.get("period") == "ALL":
            groups = period_stats.get("groups", [])
            for g in groups:
                items = g.get("statisticsItems", [])
                for item in items:
                    if item.get("key") == "cornerKicks" or item.get("name") == "Corner kicks":
                        try:
                            home_val = int(item.get("home", 0))
                            away_val = int(item.get("away", 0))
                            return home_val, away_val
                        except Exception:
                            pass
    return None, None


def _get(path: str) -> Optional[dict]:
    return safe_get(f"{_BASE}{path}")


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


def get_all_event_odds(event_id: int) -> list[dict]:
    """Fetch all odds markets for provider 1 (Bet365)."""
    data = _get(f"/event/{event_id}/odds/1/all")
    if not data:
        return []
    return data.get("markets", [])


def parse_all_odds(markets: list[dict]) -> tuple[dict, dict, dict, dict, dict, dict]:
    """Parse 1X2, Over/Under 2.5, and Both Teams to Score (Opening and Closing)."""
    o1x2_closing = {"oran_1": None, "oran_x": None, "oran_2": None}
    o1x2_opening = {"oran_1_acilis": None, "oran_x_acilis": None, "oran_2_acilis": None}
    
    ou_closing = {"alt_orani": None, "ust_orani": None}
    ou_opening = {"alt_orani_acilis": None, "ust_orani_acilis": None}
    
    btts_closing = {"kg_var": None, "kg_yok": None}
    btts_opening = {"kg_var_acilis": None, "kg_yok_acilis": None}

    for m in markets:
        mgroup = m.get("marketGroup")
        mname = m.get("marketName")
        
        # 1. 1X2
        if mgroup == "1X2" and mname == "Full time":
            choices = m.get("choices", [])
            for c in choices:
                val = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
                val_init = _frac_to_dec(c.get("initialFractionalValue")) or c.get("initialDecimalValue") or val
                
                cname = c.get("name")
                if cname == "1":
                    o1x2_closing["oran_1"] = round(float(val), 2) if val else None
                    o1x2_opening["oran_1_acilis"] = round(float(val_init), 2) if val_init else None
                elif cname == "X":
                    o1x2_closing["oran_x"] = round(float(val), 2) if val else None
                    o1x2_opening["oran_x_acilis"] = round(float(val_init), 2) if val_init else None
                elif cname == "2":
                    o1x2_closing["oran_2"] = round(float(val), 2) if val else None
                    o1x2_opening["oran_2_acilis"] = round(float(val_init), 2) if val_init else None

        # 2. Over/Under 2.5
        elif mgroup == "Match goals" and m.get("choiceGroup") == "2.5":
            choices = m.get("choices", [])
            for c in choices:
                val = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
                val_init = _frac_to_dec(c.get("initialFractionalValue")) or c.get("initialDecimalValue") or val
                
                cname = c.get("name")
                if cname == "Over":
                    ou_closing["ust_orani"] = round(float(val), 2) if val else None
                    ou_opening["ust_orani_acilis"] = round(float(val_init), 2) if val_init else None
                elif cname == "Under":
                    ou_closing["alt_orani"] = round(float(val), 2) if val else None
                    ou_opening["alt_orani_acilis"] = round(float(val_init), 2) if val_init else None

        # 3. Both Teams to Score
        elif mgroup == "Both teams to score":
            choices = m.get("choices", [])
            for c in choices:
                val = _frac_to_dec(c.get("fractionalValue")) or c.get("decimalValue")
                val_init = _frac_to_dec(c.get("initialFractionalValue")) or c.get("initialDecimalValue") or val
                
                cname = c.get("name")
                if cname == "Yes":
                    btts_closing["kg_var"] = round(float(val), 2) if val else None
                    btts_opening["kg_var_acilis"] = round(float(val_init), 2) if val_init else None
                elif cname == "No":
                    btts_closing["kg_yok"] = round(float(val), 2) if val else None
                    btts_opening["kg_yok_acilis"] = round(float(val_init), 2) if val_init else None

    return o1x2_closing, o1x2_opening, ou_closing, ou_opening, btts_closing, btts_opening


def _calc_avg_odds(o1, ox, o2) -> tuple[Optional[float], Optional[float]]:
    vals = [v for v in [o1, ox, o2] if v]
    if not vals:
        return None, None
    return round(min(vals), 2), round(max(vals), 2)


from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_today_events(target_date: Optional[datetime.date] = None) -> list[dict]:
    """
    Belirtilen tarihin maçlarını SofaScore'dan çeker.
    target_date: None ise bugün.
    """
    if target_date is None:
        target_date = datetime.date.today()

    date_str = target_date.strftime("%Y-%m-%d")
    logger.info("today_matches: %s için lig bazlı maçlar çekiliyor", date_str)

    events = []
    
    # 1. Lig bazlı maçları paralel olarak sorgula
    def fetch_tour_events(item):
        name, tid = item
        url = f"/unique-tournament/{tid}/scheduled-events/{date_str}"
        data = _get(url)
        if data:
            tour_events = data.get("events", [])
            if tour_events:
                return name, tour_events
        return name, []

    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = {executor.submit(fetch_tour_events, (name, tid)): (name, tid) for name, tid in SOFASCORE_TOURNAMENTS.items()}
        for future in as_completed(futures):
            try:
                name, tour_events = future.result()
                if tour_events:
                    logger.info("today_matches: %s liginden %d maç bulundu", name, len(tour_events))
                    events.extend(tour_events)
            except Exception as e:
                logger.warning(f"Lig çekme hatası: {e}")

    logger.info("today_matches: Toplam %d etkinlik bulundu", len(events))
    if not events:
        return []

    # 2. Etkinlik detaylarını ve oranlarını paralel olarak sorgula
    rows = []
    
    def process_single_event(event):
        eid = event.get("id")
        if not eid:
            return None

        league_info = event.get("tournament", {}).get("category", {})
        league_name = event.get("tournament", {}).get("name", "")
        country = league_info.get("name", "")
        full_league = f"{country} - {league_name}" if country else league_name

        home = event.get("homeTeam", {}).get("name", "").strip()
        away = event.get("awayTeam", {}).get("name", "").strip()
        if not home or not away:
            return None

        ts = event.get("startTimestamp", 0)
        dt = datetime.datetime.utcfromtimestamp(ts) + datetime.timedelta(hours=3)
        tarih = dt.strftime("%d.%m.%Y")
        saat  = dt.strftime("%H:%M")

        # Oranları çek
        markets_data = get_all_event_odds(eid)
        o1x2_closing, o1x2_opening, ou_closing, ou_opening, btts_closing, btts_opening = parse_all_odds(markets_data)

        oran_1 = o1x2_closing.get("oran_1")
        oran_x = o1x2_closing.get("oran_x")
        oran_2 = o1x2_closing.get("oran_2")
        ort_min, ort_max = _calc_avg_odds(oran_1, oran_x, oran_2)

        # Skorlar, kartlar ve kornerler (maç bittiyse çek)
        status_type = event.get("status", {}).get("type", "")
        devre_skoru = None
        mac_skoru = "?:?"
        kart_ev = None
        kart_dep = None
        kirmizi_kart = 0
        korner_ev = None
        korner_dep = None
        im_6 = None

        if status_type == "finished":
            ft_h = event.get("homeScore", {}).get("current")
            ft_a = event.get("awayScore", {}).get("current")
            mac_skoru = f"{ft_h}:{ft_a}" if ft_h is not None and ft_a is not None else "?:?"

            ht_h = event.get("homeScore", {}).get("period1")
            ht_a = event.get("awayScore", {}).get("period1")
            devre_skoru = f"{ht_h}:{ht_a}" if ht_h is not None and ht_a is not None else None

            # Kartlar
            try:
                incidents = get_event_incidents(eid)
                card_data = parse_cards(incidents)
                kart_ev = card_data.get("kart_ev")
                kart_dep = card_data.get("kart_dep")
                kirmizi_kart = card_data.get("kirmizi_kart", 0)
            except Exception as e:
                logger.warning(f"Kart çekme hatası: {e}")

            # Kornerler
            try:
                korner_ev, korner_dep = get_event_corners(eid)
            except Exception as e:
                logger.warning(f"Korner çekme hatası: {e}")

            # im_6
            if ft_h is not None and ft_a is not None:
                toplam_gol = ft_h + ft_a
                if toplam_gol > 6:
                    im_6 = "2/1" if ft_h < ft_a else ("1/1" if ft_h > ft_a else "x/x")

        return {
            "tarih":            tarih,
            "saat":             saat,
            "lig":              full_league,
            "ev_sahibi":        home,
            "deplasman":        away,
            "devre_skoru":      devre_skoru,
            "mac_skoru":        mac_skoru,
            "onceki_skorlar":   None,
            "kart_ev":          kart_ev,
            "kart_dep":         kart_dep,
            "kirmizi_kart":     kirmizi_kart,
            "korner_ev":        korner_ev,
            "korner_dep":       korner_dep,
            "lig_sira_ev":      None,
            "lig_sira_dep":     None,
            "toplam_takim":     None,
            "im_6":             im_6,
            "oran_1":           oran_1,
            "oran_x":           oran_x,
            "oran_2":           oran_2,
            "alt_orani":        ou_closing.get("alt_orani"),
            "ust_orani":        ou_closing.get("ust_orani"),
            "kg_var":           btts_closing.get("kg_var"),
            "kg_yok":           btts_closing.get("kg_yok"),
            "ort_min":          ort_min,
            "ort_max":          ort_max,
            "oran_1_acilis":    o1x2_opening.get("oran_1_acilis"),
            "oran_x_acilis":    o1x2_opening.get("oran_x_acilis"),
            "oran_2_acilis":    o1x2_opening.get("oran_2_acilis"),
            "alt_orani_acilis": ou_opening.get("alt_orani_acilis"),
            "ust_orani_acilis": ou_opening.get("ust_orani_acilis"),
            "kg_var_acilis":    btts_opening.get("kg_var_acilis"),
            "kg_yok_acilis":    btts_opening.get("kg_yok_acilis"),
            "kaynak":           "sofascore",
            "kaynak_id":        eid,
        }

    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(process_single_event, event): event for event in events}
        for future in as_completed(futures):
            try:
                res = future.result()
                if res:
                    rows.append(res)
            except Exception as e:
                logger.warning(f"Maç oran işleme hatası: {e}")

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
