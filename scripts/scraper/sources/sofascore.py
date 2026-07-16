"""
SofaScore public API veri çekici.
Maç sonuçları, yarı-zaman skoru, kart istatistikleri ve oranlar.
"""

import datetime
import logging
import math
from typing import Optional
from sessions import safe_get, delay

logger = logging.getLogger(__name__)

BASE = "https://api.sofascore.com/api/v1"

# Piyasa ID'leri
_MKT_1X2  = 1   # Taraf
_MKT_OU   = 5   # Alt/Üst
_MKT_BTTS = 29  # KG Var/Yok


# ──────────────────────────────────────────────────────────────────────────────
# Yardımcı fonksiyonlar
# ──────────────────────────────────────────────────────────────────────────────

def _frac_to_dec(frac: str | None) -> Optional[float]:
    """Kesirli oranı ondalığa çevir. '3/2' → 2.50"""
    if not frac:
        return None
    frac = frac.strip()
    if "/" in frac:
        parts = frac.split("/")
        if len(parts) == 2:
            try:
                num, den = float(parts[0]), float(parts[1])
                if den == 0:
                    return None
                return round(num / den + 1, 2)
            except ValueError:
                return None
    # Doğrudan ondalık gelmiş olabilir
    try:
        v = float(frac)
        return round(v, 2) if v > 1 else None
    except ValueError:
        return None


def _extract_odds_from_market(choices: list, name_map: dict) -> dict:
    """
    Bir market listesinden istenen isimlere göre oranları çıkar.
    name_map: {"1": "oran_1", "X": "oran_x", "2": "oran_2"}
    """
    result: dict = {}
    for choice in choices:
        cname = choice.get("name", "")
        if cname not in name_map:
            continue
        # Önce initialFractionalValue (açılış), sonra fractionalValue (kapanış)
        frac = (
            choice.get("initialFractionalValue")
            or choice.get("fractionalValue")
            or choice.get("oddsFractional")
        )
        dec = _frac_to_dec(frac)
        if dec is None:
            # Bazen doğrudan decimal verilir
            for key in ("oddsDecimal", "odds"):
                raw = choice.get(key)
                if raw is not None:
                    try:
                        dec = round(float(raw), 2)
                        break
                    except (ValueError, TypeError):
                        pass
        if dec is not None and 1.01 <= dec <= 50.0:
            result[name_map[cname]] = dec
    return result


# ──────────────────────────────────────────────────────────────────────────────
# API fonksiyonları
# ──────────────────────────────────────────────────────────────────────────────

def get_events_for_date(event_date: datetime.date) -> list[dict]:
    """Bir günün tüm futbol etkinliklerini döndür."""
    date_str = event_date.strftime("%Y-%m-%d")
    url = f"{BASE}/sport/football/scheduled-events/{date_str}"
    data = safe_get(url)
    if not data:
        return []
    return data.get("events", [])


def get_event_incidents(event_id: int) -> list[dict]:
    """Maç olayları: goller, kartlar."""
    delay(is_sub=True)
    data = safe_get(f"{BASE}/event/{event_id}/incidents")
    if not data:
        return []
    return data.get("incidents", [])


def get_event_odds(event_id: int, market_id: int) -> list[dict]:
    """Belirtilen market için oranları getir."""
    delay(is_sub=True)
    data = safe_get(f"{BASE}/event/{event_id}/odds/{market_id}/all/1")
    if not data:
        return []
    return data.get("markets", [])


# ──────────────────────────────────────────────────────────────────────────────
# Kart ayrıştırma
# ──────────────────────────────────────────────────────────────────────────────

def parse_cards(incidents: list[dict]) -> dict:
    """İnsident listesinden kart sayılarını çıkar."""
    kart_ev = kart_dep = kirmizi = 0
    for inc in incidents:
        itype = inc.get("incidentType", "")
        iclass = inc.get("incidentClass", "")
        is_home = inc.get("isHome", None)
        # Bazı versiyonlarda "team" alanı "home"/"away" string olur
        team_str = inc.get("team", "")

        if itype != "card":
            continue

        if is_home is None:
            is_home = team_str == "home"

        if iclass in ("yellow",):
            if is_home:
                kart_ev += 1
            else:
                kart_dep += 1
        elif iclass in ("red", "yellowRed", "directRed"):
            kirmizi += 1
            # Kırmızı kartı da toplam kartlar içine say
            if is_home:
                kart_ev += 1
            else:
                kart_dep += 1

    return {"kart_ev": kart_ev, "kart_dep": kart_dep, "kirmizi_kart": kirmizi}


# ──────────────────────────────────────────────────────────────────────────────
# Oran ayrıştırma
# ──────────────────────────────────────────────────────────────────────────────

def parse_1x2(markets: list[dict]) -> dict:
    """1X2 oranlarını ayrıştır."""
    name_map = {"1": "oran_1", "X": "oran_x", "2": "oran_2"}
    for market in markets:
        choices = market.get("choices", [])
        result = _extract_odds_from_market(choices, name_map)
        if result:
            return result
    return {}


def parse_over_under(markets: list[dict], line: float = 2.5) -> dict:
    """Alt/Üst oranlarını ayrıştır (varsayılan 2.5 çizgisi)."""
    target = str(line)
    for market in markets:
        # Market adında hedef çizgiyi ara
        mname = market.get("marketName", "") or ""
        choices = market.get("choices", [])

        # Alt/Üst market için doğru çizgiyi bul
        for choice in choices:
            handicap = str(choice.get("handicap", "") or "")
            # Bazı API yanıtlarında handicap doğrudan seçenekte olur
            if handicap == target or mname.endswith(target):
                name_map = {"Over": "ust_orani", "Under": "alt_orani"}
                result = _extract_odds_from_market(choices, name_map)
                if result:
                    return result

        # Çizgi bulunamazsa ilk Alt/Üst marketini dene
        if any(c.get("name") in ("Over", "Under") for c in choices):
            name_map = {"Over": "ust_orani", "Under": "alt_orani"}
            result = _extract_odds_from_market(choices, name_map)
            if result:
                return result

    return {}


def parse_btts(markets: list[dict]) -> dict:
    """KG Var/Yok oranlarını ayrıştır."""
    name_map = {"Yes": "kg_var", "No": "kg_yok"}
    for market in markets:
        choices = market.get("choices", [])
        result = _extract_odds_from_market(choices, name_map)
        if result:
            return result
    return {}


def _calc_avg_odds(o1: Optional[float], ox: Optional[float], o2: Optional[float]) -> tuple[Optional[float], Optional[float]]:
    """Üç taraf oranından teorik ortalama aralığı hesapla."""
    vals = [v for v in [o1, ox, o2] if v is not None]
    if not vals:
        return None, None
    mn = round(min(vals), 2)
    mx = round(max(vals), 2)
    return mn, mx


# ──────────────────────────────────────────────────────────────────────────────
# Ana dönüştürücü
# ──────────────────────────────────────────────────────────────────────────────

def event_to_row(
    event: dict,
    league_name: str,
    incidents: list[dict],
    odds_1x2: list[dict],
    odds_ou: list[dict],
    odds_btts: list[dict],
) -> Optional[dict]:
    """
    SofaScore etkinliğini gecmis_maclar satırına dönüştür.
    None döndürürse kayıt atlanır.
    """
    try:
        home_team = event.get("homeTeam", {}).get("name", "").strip()
        away_team = event.get("awayTeam", {}).get("name", "").strip()
        if not home_team or not away_team:
            return None

        # ── Skor ──
        h_score = event.get("homeScore", {})
        a_score = event.get("awayScore", {})
        ft_h = h_score.get("current")
        ft_a = a_score.get("current")
        ht_h = h_score.get("period1")
        ht_a = a_score.get("period1")

        if ft_h is None or ft_a is None:
            return None  # Skorsuz maç → kaydet

        mac_skoru   = f"{ft_h}:{ft_a}"
        devre_skoru = f"{ht_h}:{ht_a}" if ht_h is not None and ht_a is not None else None

        # ── Tarih/saat ──
        ts  = event.get("startTimestamp", 0)
        import datetime
        dt  = datetime.datetime.utcfromtimestamp(ts) + datetime.timedelta(hours=3)  # UTC→TR
        tarih = dt.strftime("%d.%m.%Y")
        saat  = dt.strftime("%H:%M")

        # ── Kartlar ──
        card_data = parse_cards(incidents)

        # ── Oranlar ──
        o1x2  = parse_1x2(odds_1x2)
        o_ou  = parse_over_under(odds_ou)
        o_btts= parse_btts(odds_btts)

        oran_1 = o1x2.get("oran_1")
        oran_x = o1x2.get("oran_x")
        oran_2 = o1x2.get("oran_2")

        ort_min, ort_max = _calc_avg_odds(oran_1, oran_x, oran_2)

        # ── im_6 tahmini (toplam gol > 6 ise "Üst" olarak işaretle) ──
        toplam_gol = (ft_h or 0) + (ft_a or 0)
        if toplam_gol > 6:
            im_6 = "2/1" if ft_h < ft_a else ("1/1" if ft_h > ft_a else "x/x")
        else:
            im_6 = None

        return {
            "tarih":          tarih,
            "saat":           saat,
            "lig":            league_name,
            "ev_sahibi":      home_team,
            "deplasman":      away_team,
            "devre_skoru":    devre_skoru,
            "mac_skoru":      mac_skoru,
            "onceki_skorlar": None,
            "kart_ev":        card_data.get("kart_ev") or None,
            "kart_dep":       card_data.get("kart_dep") or None,
            "kirmizi_kart":   card_data.get("kirmizi_kart", 0),
            "lig_sira_ev":    None,
            "lig_sira_dep":   None,
            "toplam_takim":   None,
            "im_6":           im_6,
            "oran_1":         oran_1,
            "oran_x":         oran_x,
            "oran_2":         oran_2,
            "alt_orani":      o_ou.get("alt_orani"),
            "ust_orani":      o_ou.get("ust_orani"),
            "kg_var":         o_btts.get("kg_var"),
            "kg_yok":         o_btts.get("kg_yok"),
            "ort_min":        ort_min,
            "ort_max":        ort_max,
            "kaynak":         "sofascore",
            "kaynak_id":      event.get("id"),
        }
    except Exception as exc:
        logger.error(f"event_to_row hatası: {exc}")
        return None
