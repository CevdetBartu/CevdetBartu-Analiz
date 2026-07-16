"""
Dönen User-Agent başlıkları ile HTTP oturumu yönetimi.
"""

import random
import time
import requests
import logging
from config import DELAY_MIN, DELAY_MAX, SUB_DELAY_MIN, SUB_DELAY_MAX, MAX_RETRIES

logger = logging.getLogger(__name__)

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
]

_ACCEPT_LANGS = [
    "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "tr,en-US;q=0.9,en;q=0.8",
    "en-US,en;q=0.9,tr;q=0.8",
]


def make_sofascore_headers() -> dict:
    return {
        "User-Agent":      random.choice(_USER_AGENTS),
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": random.choice(_ACCEPT_LANGS),
        "Accept-Encoding": "gzip, deflate, br",
        "Origin":          "https://www.sofascore.com",
        "Referer":         "https://www.sofascore.com/",
        "Cache-Control":   "no-cache",
        "Pragma":          "no-cache",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    }


def safe_get(url: str, timeout: int = 15, is_sub: bool = False) -> dict | None:
    """
    GET isteği atar, otomatik yeniden dener.
    is_sub=True → alt-istek (oran/istatistik), daha kısa bekleme.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        headers = make_sofascore_headers()
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 429:
                wait = 30 + random.uniform(0, 15)
                logger.warning(f"[429] Rate limited → {wait:.0f}s bekleniyor. URL: {url}")
                time.sleep(wait)
            elif resp.status_code == 403:
                logger.warning(f"[403] Erişim reddedildi. URL: {url}")
                return None
            elif resp.status_code == 404:
                return None  # Yok, normal
            else:
                logger.warning(f"[{resp.status_code}] Deneme {attempt}/{MAX_RETRIES}. URL: {url}")
                if attempt < MAX_RETRIES:
                    time.sleep(random.uniform(3, 8))
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout. Deneme {attempt}/{MAX_RETRIES}. URL: {url}")
            if attempt < MAX_RETRIES:
                time.sleep(random.uniform(2, 5))
        except requests.exceptions.RequestException as e:
            logger.error(f"İstek hatası: {e}. URL: {url}")
            if attempt < MAX_RETRIES:
                time.sleep(random.uniform(2, 5))

    return None


def delay(is_sub: bool = False) -> None:
    """İstekler arası rastgele bekleme."""
    if is_sub:
        time.sleep(random.uniform(SUB_DELAY_MIN, SUB_DELAY_MAX))
    else:
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))
