import time
import datetime
import logging
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sources.today_matches import run_today_scrape

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def run_bulletin_task():
    logger.info("Mackolik Bülten Çekim Görevi Başladı!")
    
    # Bugün
    today = datetime.datetime.now().date()
    res = run_today_scrape(today)
    logger.info(f"Bugün ({today}) için Mackolik'ten {res.get('added',0) + res.get('updated',0)} maç güncellendi.")
    
    time.sleep(2)
    
    # Yarın
    tomorrow = today + datetime.timedelta(days=1)
    res = run_today_scrape(tomorrow)
    logger.info(f"Yarın ({tomorrow}) için Mackolik'ten {res.get('added',0) + res.get('updated',0)} maç güncellendi.")
    
    logger.info("Bülten çekim görevi tamamlandı.")

def main_loop():
    logger.info("🔄 [CRON MACKOLIK BULLETIN] Başlatıldı. Her saat başı yeni bülteni çeker.")
    while True:
        try:
            run_bulletin_task()
        except Exception as e:
            logger.error(f"Hata: {e}")
            
        logger.info("Bir sonraki bülten çekimi için 1 saat bekleniyor...")
        time.sleep(3600)

if __name__ == "__main__":
    run_bulletin_task()

