"""
Flask kontrol sunucusu — sadece dahili (localhost:5051) erişim.
Express API server bu sunucuya proxy atar.

Endpoint'ler:
  GET  /stats          → Veritabanı istatistikleri + scraper durumu
  POST /start          → Scraper'ı başlat
  POST /stop           → Scraper'ı durdur
  POST /reset          → Son işlenen tarihi sıfırla (baştan tarama)
  GET  /healthz        → Sunucu sağlık kontrolü
"""

import logging
import sys
import os

# Çalışma dizinini scripte göre ayarla
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
import db
import worker as worker_module
from config import FLASK_PORT, SEASONS_BACK
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

W = worker_module.worker  # global ScraperWorker örneği


@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok"})


# ── Futbol Scraper Uçları ────────────────────────────────────────────────────

@app.get("/stats")
def stats():
    db_stats    = db.get_stats()
    worker_info = W.get_info()
    return jsonify({
        "db":     db_stats,
        "worker": worker_info,
    })


@app.post("/start")
def start():
    body          = request.get_json(silent=True) or {}
    seasons_back  = int(body.get("seasons_back", SEASONS_BACK))
    seasons_back  = max(1, min(10, seasons_back))  # 1-10 sezon arası sınırla

    if W.is_running():
        return jsonify({"ok": False, "message": "Scraper zaten çalışıyor"}), 409

    db.init_db()
    ok = W.start(seasons_back=seasons_back)
    if ok:
        return jsonify({"ok": True, "message": f"Scraper başlatıldı ({seasons_back} sezon)"})
    return jsonify({"ok": False, "message": "Başlatılamadı"}), 500


@app.post("/stop")
def stop():
    if not W.is_running():
        return jsonify({"ok": False, "message": "Scraper çalışmıyor"})
    W.stop()
    return jsonify({"ok": True, "message": "Durdurma sinyali gönderildi"})


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
    """Son işlenen tarihi sıfırla → scraper baştan tarar."""
    if W.is_running():
        return jsonify({"ok": False, "message": "Önce scraper'ı durdurun"}), 409
    db.set_state("last_processed_date", "")
    return jsonify({"ok": True, "message": "Tarih sıfırlandı — sıradaki başlatmada baştan taranır"})


_live_matches_cache = {
    "data": None,
    "timestamp": 0
}

@app.get("/live-matches")
def live_matches():
    now = time.time()
    # Cache for 15 seconds to prevent rate limits
    if _live_matches_cache["data"] is None or (now - _live_matches_cache["timestamp"] > 15):
        _live_matches_cache["data"] = get_live_matches_data()
        _live_matches_cache["timestamp"] = now
    return jsonify(_live_matches_cache["data"])


if __name__ == "__main__":
    db.init_db()
    logger.info(f"Scraper kontrol sunucusu port {FLASK_PORT}'te başlatılıyor…")
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=False, use_reloader=False)
