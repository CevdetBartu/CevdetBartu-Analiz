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
    seasons_back  = max(1, min(8, seasons_back))  # 1-8 sezon arası sınırla

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


@app.post("/reset")
def reset():
    """Son işlenen tarihi sıfırla → scraper baştan tarar."""
    if W.is_running():
        return jsonify({"ok": False, "message": "Önce scraper'ı durdurun"}), 409
    db.set_state("last_processed_date", "")
    return jsonify({"ok": True, "message": "Tarih sıfırlandı — sıradaki başlatmada baştan taranır"})


if __name__ == "__main__":
    db.init_db()
    logger.info(f"Scraper kontrol sunucusu port {FLASK_PORT}'te başlatılıyor…")
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=False, use_reloader=False)
