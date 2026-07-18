"""
Dönen User-Agent başlıkları ile HTTP oturumu yönetimi.
"""

import random
import time
from curl_cffi import requests
import logging
from config import DELAY_MIN, DELAY_MAX, SUB_DELAY_MIN, SUB_DELAY_MAX, MAX_RETRIES

logger = logging.getLogger(__name__)


def safe_get(url: str, timeout: int = 15, is_sub: bool = False) -> dict | None:
    """
    GET isteği atar, otomatik yeniden dener.
    is_sub=True → alt-istek (oran/istatistik), daha kısa bekleme.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(
                url, 
                timeout=timeout, 
                impersonate="chrome",
                headers={
                    "Referer": "https://www.sofascore.com/",
                    "Origin": "https://www.sofascore.com",
                    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
                }
            )
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
        except Exception as e:
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
