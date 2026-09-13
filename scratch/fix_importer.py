import os
import sys

fpath = os.path.join("scripts", "scraper", "historical_mackolik_importer.py")
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

record_str = """                record = {
                    "tarih": date_db_format,
                    "saat": saat,
                    "lig": lig,
                    "ev_sahibi": home,
                    "deplasman": away,
                    "devre_skoru": devre_skoru,
                    "mac_skoru": mac_skoru,
                    "onceki_skorlar": None,
                    "kart_ev": None, "kart_dep": None, "kirmizi_kart": None,
                    "korner_ev": None, "korner_dep": None,
                    "lig_sira_ev": None, "lig_sira_dep": None,
                    "toplam_takim": None, "im_6": None,
                    "oran_1": o1, "oran_x": ox, "oran_2": o2,
                    "alt_orani": alt, "ust_orani": ust,
                    "kg_var": None, "kg_yok": None,
                    "ort_min": None, "ort_max": None,
                    "oran_1_acilis": o1, "oran_x_acilis": ox, "oran_2_acilis": o2,
                    "alt_orani_acilis": alt, "ust_orani_acilis": ust,
                    "kg_var_acilis": None, "kg_yok_acilis": None,
                    "alt_orani_35": None, "ust_orani_35": None,
                    "alt_orani_35_acilis": None, "ust_orani_35_acilis": None,
                    "iy_alt_orani_15": None, "iy_ust_orani_15": None,
                    "iy_alt_orani_15_acilis": None, "iy_ust_orani_15_acilis": None,
                    "iy_alt_orani_05": None, "iy_ust_orani_05": None,
                    "iy_alt_orani_05_acilis": None, "iy_ust_orani_05_acilis": None,
                    "kaynak": "mackolik",
                    "kaynak_id": kaynak_id,
                    "sofascore_event_id": kaynak_id,
                    "kita": None, "lig_seviyesi": None,
                    "teknik_direktor_ev": None, "teknik_direktor_dep": None,
                    "hakem": None, "stadyum": None
                }"""

# Bul ve değiştir
import re
new_code = re.sub(r"                record = \{.*?\n                \}", record_str, code, flags=re.DOTALL)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(new_code)

