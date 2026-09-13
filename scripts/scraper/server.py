"""
Flask kontrol sunucusu – sadece dahili (localhost:5051) erişim.
Express API server bu sunucuya proxy atar.
"""

import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
import db
from config import FLASK_PORT
from sources.today_matches import run_today_scrape
import time
from sources.live_matches import get_live_matches_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("scraper.server")

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok"})


@app.get("/stats")
def stats():
    db_stats = db.get_stats()
    return jsonify({
        "db": db_stats,
        "worker": {
            "status": "idle",
            "last_processed_date": "",
            "active": False
        },
    })


@app.post("/start")
def start():
    # Eski worker.py kaldırıldı, sistem Mackolik CRON betikleriyle (auto_nightly_importer vb) otomatik çalışıyor.
    return jsonify({"ok": True, "message": "Scraper başlatıldı. (Not: Sistem artık Mackolik CRON takvimi ile otomatik çalışmaktadır, bu butona basmanız gerekmez.)"})


@app.post("/stop")
def stop():
    return jsonify({"ok": True, "message": "Scraper durduruldu."})


@app.post("/today")
def today():
    body = request.get_json(silent=True) or {}
    date_str = body.get("date")
    
    target_date = None
    if date_str:
        try:
            import datetime
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            pass
            
    res = run_today_scrape(target_date)
    return jsonify(res)


@app.post("/reset")
def reset():
    db.set_state("last_processed_date", "")
    return jsonify({"ok": True, "message": "Tarih sıfırlandı."})


@app.post("/set-start-date")
def set_start_date():
    body = request.get_json(silent=True) or {}
    start_date = body.get("start_date")
    if start_date:
        db.set_custom_setting("custom_start_date", str(start_date).strip())
        return jsonify({"ok": True, "message": f"Veri aralığı başlangıç tarihi güncellendi: {start_date}"})
    return jsonify({"ok": False, "message": "Geçersiz tarih parametresi"}), 400


_live_matches_cache = {
    "data": None,
    "timestamp": 0
}

@app.get("/live-matches")
def live_matches():
    now = time.time()
    if _live_matches_cache["data"] is None or (now - _live_matches_cache["timestamp"] > 30):
        _live_matches_cache["data"] = get_live_matches_data()
        _live_matches_cache["timestamp"] = time.time()
    return jsonify(_live_matches_cache["data"])


if __name__ == "__main__":
    db.init_db()
    logger.info(f"Scraper kontrol sunucusu port {FLASK_PORT}'te başlatılıyor...")
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=False, use_reloader=False)

