"""
Arka plan veri çekme işçisi — football-data.co.uk CSV tabanlı.
Her lig × sezon kombinasyonu için tek bir CSV indirilir ve veritabanına yazılır.
"""

import threading
import logging
import datetime
import time
import random
from typing import Optional

import db
from config import LEAGUES, SEASONS_BACK, DELAY_MIN, DELAY_MAX
from sources.football_data_uk import download_csv, parse_csv, current_and_past_seasons

logger = logging.getLogger(__name__)


class ScraperWorker:
    def __init__(self) -> None:
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._lock = threading.Lock()

        self.status:        str = "durdu"
        self.total_added:   int = 0
        self.total_skipped: int = 0
        self.current_task:  Optional[str] = None   # "T1 2425" gibi
        self.last_error:    Optional[str] = None
        self.start_time:    Optional[float] = None

    # ── Kontrol ──────────────────────────────────────────────────────────────

    def start(self, seasons_back: int = SEASONS_BACK) -> bool:
        with self._lock:
            if self._thread and self._thread.is_alive():
                return False
            self._stop_event.clear()
            self.status = "çalışıyor"
            self.total_added = 0
            self.total_skipped = 0
            self.last_error = None
            self.start_time = time.time()
            self._thread = threading.Thread(
                target=self._run,
                args=(seasons_back,),
                daemon=True,
                name="ScraperWorker",
            )
            self._thread.start()
            logger.info(f"Scraper başlatıldı ({seasons_back} sezon, {len(LEAGUES)} lig)")
            return True

    def stop(self) -> None:
        self._stop_event.set()
        logger.info("Scraper durdurma sinyali gönderildi")

    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def get_info(self) -> dict:
        elapsed = None
        if self.start_time:
            elapsed = round(time.time() - self.start_time, 0)
        return {
            "status":        self.status,
            "is_running":    self.is_running(),
            "current_date":  self.current_task,
            "total_added":   self.total_added,
            "total_skipped": self.total_skipped,
            "last_error":    self.last_error,
            "elapsed_sec":   elapsed,
        }

    # ── Ana döngü ─────────────────────────────────────────────────────────────

    def _run(self, seasons_back: int) -> None:
        try:
            db.init_db()
            seasons = current_and_past_seasons(seasons_back)
            league_codes = list(LEAGUES.keys())

            logger.info(f"Sezonlar: {seasons} | Ligler: {league_codes}")

            for season in seasons:
                for code in league_codes:
                    if self._stop_event.is_set():
                        self.status = "durdu"
                        logger.info("Scraper kullanıcı tarafından durduruldu")
                        return

                    self.current_task = f"{code} {season}"
                    self._process(code, season)

                    # Birbirini takip eden istekler arası kısa bekleme
                    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

            self.status = "tamamlandı"
            logger.info(
                f"Scraper tamamlandı. Eklenen: {self.total_added}, Atlanan: {self.total_skipped}"
            )
        except Exception as exc:
            self.status = "hata"
            self.last_error = str(exc)
            logger.exception(f"Scraper kritik hata: {exc}")

    def _process(self, league_code: str, season: str) -> None:
        league_name = LEAGUES[league_code]
        logger.info(f"→ {league_name} ({league_code}) {season} çekiliyor…")

        csv_text = download_csv(league_code, season)
        if csv_text is None:
            logger.debug(f"  Atlandı (veri yok): {league_code} {season}")
            return

        rows = parse_csv(csv_text, league_name, league_code, season)
        if not rows:
            logger.debug(f"  Ayrıştırılan satır yok: {league_code} {season}")
            return

        added = skipped = 0
        for row in rows:
            if self._stop_event.is_set():
                return
            ok = db.upsert_match(row)
            if ok:
                added += 1
            else:
                skipped += 1

        self.total_added += added
        self.total_skipped += skipped
        logger.info(
            f"  ✓ {league_name} {season}: {len(rows)} maç → "
            f"+{added} eklendi, {skipped} mevcut"
        )


# Global örnek
worker = ScraperWorker()
