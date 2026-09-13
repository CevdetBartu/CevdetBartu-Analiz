"""
Maç başlamadan önce oranları güncel tutmak için Mackolik'ten tüm güncel bülteni 
her 5 dakikada bir çekerek veritabanını günceller. (Sofascore kaldırıldı)
"""
import sys
import time
import datetime
import logging
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sources.today_matches import run_today_scrape

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def fetch_and_update_closing_odds_5min():
    """Her 5 dakikada bir günün maçlarının güncel Mackolik oranlarını çeker."""
    target_date = datetime.datetime.now().date()
    res = run_today_scrape(target_date)
    updated = res.get("added", 0) + res.get("updated", 0)
    print(f"✅ [MACKOLIK ODDS UPDATER] {updated} maçın oranı başarıyla güncellendi.")
    return updated

def run_loop():
    print("🔄 [MACKOLIK ODDS UPDATER] Running continuously every 5 minutes...")
    while True:
        try:
            fetch_and_update_closing_odds_5min()
        except Exception as e:
            print(f"Error in odds updater: {e}")
        time.sleep(300)

if __name__ == "__main__":
    fetch_and_update_closing_odds_5min()

