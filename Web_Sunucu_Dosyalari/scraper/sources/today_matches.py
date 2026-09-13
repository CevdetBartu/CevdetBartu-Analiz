import datetime
import sqlite3
import time
import requests
import bs4
import logging
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)

def fetch_mackolik_events() -> List[Dict]:
    logger.info(f"Fetching Mackolik Iddaa Programi (All Dates)...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    url = "https://arsiv.mackolik.com/Iddaa-Programi"
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        r.encoding = 'utf-8' # Explicitly force UTF-8
        html = r.text
    except Exception as e:
        logger.error(f"Mackolik HTML indirilemedi: {e}")
        return []
        
    soup = bs4.BeautifulSoup(html, 'html.parser')
    rows = soup.find_all('tr')
    
    matches = []
    current_league = "Bilinmeyen Lig"
    current_date = datetime.date.today().strftime("%Y-%m-%d")
    
    def safe_float(val):
        try:
            return float(val.replace(',', '.'))
        except:
            return None
            
    for i, r_tag in enumerate(rows):
        cls = r_tag.get('class', [])
        
        if 'iddaa-oyna-title' in cls:
            current_league = r_tag.text.strip()
            
        elif 'iddaa-oyna-title2' in cls:
            date_td = r_tag.find('td', {'rateSort': 'tarih_1'})
            if date_td:
                d_str = date_td.text.strip() # e.g. 27.08.2026
                try:
                    current_date = datetime.datetime.strptime(d_str, "%d.%m.%Y").strftime("%Y-%m-%d")
                except:
                    pass
            
        elif r_tag.has_attr('id') and r_tag['id'].startswith('Tr'):
            cols = r_tag.find_all('td')
            if len(cols) > 20:
                try:
                    time_str = cols[0].text.strip()
                    teams_raw = cols[7].text.strip()
                    
                    parts = teams_raw.split(' - ')
                    home = parts[0]
                    away = parts[1] if len(parts) > 1 else "Unknown"
                    
                    home = home.split(' (')[0].strip()
                    away = away.split(') ')[-1].strip() if ')' in away else away.strip()
                    
                    ms1 = msx = ms2 = au_a = au_u = None
                    
                    for a_tag in r_tag.find_all('a', class_='iddaa-rate'):
                        rate_text = a_tag.text.strip()
                        c = a_tag.get('class', [])
                        if 'MS1' in c: ms1 = rate_text
                        if 'MSX' in c: msx = rate_text
                        if 'MS2' in c: ms2 = rate_text
                        if 'AU1' in c: au_a = rate_text
                        if 'AU2' in c: au_u = rate_text

                    matches.append({
                        "tarih": current_date,
                        "saat": time_str,
                        "lig": current_league,
                        "ev_sahibi": home,
                        "deplasman": away,
                        "devre_skoru": None,
                        "mac_skoru": None,
                        "kart_ev": None,
                        "kart_dep": None,
                        "kirmizi_kart": None,
                        "korner_ev": None,
                        "korner_dep": None,
                        "lig_sira_ev": None,
                        "lig_sira_dep": None,
                        "toplam_takim": None,
                        "im_6": None,
                        "oran_1": safe_float(ms1) if ms1 else None,
                        "oran_x": safe_float(msx) if msx else None,
                        "oran_2": safe_float(ms2) if ms2 else None,
                        "alt_orani": safe_float(au_a) if au_a else None,
                        "ust_orani": safe_float(au_u) if au_u else None,
                        "kg_var": None,
                        "kg_yok": None,
                        "ort_min": None,
                        "ort_max": None,
                        "oran_1_acilis": None,
                        "oran_x_acilis": None,
                        "oran_2_acilis": None,
                        "alt_orani_acilis": None,
                        "ust_orani_acilis": None,
                        "kg_var_acilis": None,
                        "kg_yok_acilis": None,
                    })
                except Exception as e:
                    logger.warning(f"Error parsing Mackolik match row: {e}")
                    continue
                    
    logger.info(f"Mackolik: Fetched {len(matches)} matches total.")
    return matches

def upsert_match(row: dict, conn=None) -> None:
    should_close = False
    if conn is None:
        import os; conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "gecmis_maclar.db"), check_same_thread=False)
        should_close = True

    try:
        c = conn.cursor()
        c.execute("""
            SELECT id FROM gecmis_maclar 
            WHERE tarih = ? AND ev_sahibi = ? AND deplasman = ?
        """, (row["tarih"], row["ev_sahibi"], row["deplasman"]))
        
        ex = c.fetchone()
        if ex:
            mid = ex[0]
            c.execute("""
                UPDATE gecmis_maclar SET 
                  saat=?, lig=?, 
                  oran_1=?, oran_x=?, oran_2=?, 
                  alt_orani=?, ust_orani=?
                WHERE id=?
            """, (
                row.get("saat"), row.get("lig"),
                row.get("oran_1"), row.get("oran_x"), row.get("oran_2"),
                row.get("alt_orani"), row.get("ust_orani"),
                mid
            ))
        else:
            c.execute("""
                INSERT INTO gecmis_maclar (
                  tarih, saat, lig, ev_sahibi, deplasman,
                  oran_1, oran_x, oran_2,
                  alt_orani, ust_orani
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row.get("tarih"), row.get("saat"), row.get("lig"),
                row.get("ev_sahibi"), row.get("deplasman"),
                row.get("oran_1"), row.get("oran_x"), row.get("oran_2"),
                row.get("alt_orani"), row.get("ust_orani")
            ))
        conn.commit()
    finally:
        if should_close:
            conn.close()

def run_today_scrape(target_date: Optional[datetime.date] = None, conn=None) -> dict:
    rows = fetch_mackolik_events()
    
    if target_date:
        target_date_str = target_date.strftime("%Y-%m-%d")
        tomorrow = target_date + datetime.timedelta(days=1)
        tomorrow_str = tomorrow.strftime("%Y-%m-%d")
        
        # We want matches for target_date, plus matches for tomorrow <= 06:00
        filtered_rows = []
        for r in rows:
            if r["tarih"] == target_date_str:
                filtered_rows.append(r)
            elif r["tarih"] == tomorrow_str and r.get("saat") and r["saat"] <= "06:00":
                filtered_rows.append(r)
        open("scratch/debug.txt", "w").write(str(len(filtered_rows)) + " - " + str([r["tarih"] for r in rows[:5]])); rows = filtered_rows

    if not rows:
        return {"ok": True, "added": 0, "updated": 0, "message": "Maç bulunamadı (Mackolik)"}

    added = 0
    for row in rows:
        try:
            upsert_match(row, conn=conn)
            added += 1
        except Exception as e:
            open("scratch/error.txt", "w").write(str(e))

    return {"ok": True, "added": added, "updated": 0, "message": f"{added} maç güncellendi (Mackolik)"}
