#!/usr/bin/env python3
"""
Scraper servisini başlat.
  python3 scripts/scraper/run.py
"""
import os
import sys

# Scraper paketini PATH'e ekle
_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _dir)

from server import app, db, FLASK_PORT
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

if __name__ == "__main__":
    db.init_db()
    print(f"⚽  Sykn1977 Scraper Sunucusu → http://127.0.0.1:{FLASK_PORT}")
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=False, use_reloader=False, threaded=True)
