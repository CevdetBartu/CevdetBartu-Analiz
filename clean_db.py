# -*- coding: utf-8 -*-
import sqlite3

conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')

def clean_text(text):
    if not text:
        return text
    
    # Common fixes for specific corruptions
    fixes = {
        'ngiltere': 'Ingiltere',
        'T\u01ECrkiye': 'Turkiye',
        'S\u01ECper': 'Super',
        'Kupas\ufffd': 'Kupasi',
        'Bel\ufffdika': 'Belcika',
        '\ufffdsko\ufffdya': 'Iskocya',
        '\ufffdspanya': 'Ispanya',
        '\ufffdtalya': 'Italya',
        '\ufffdsrail': 'Israil',
        '\ufffdsve\ufffd': 'Isvec',
        '\ufffdsvi\ufffdre': 'Isvicre',
        '\ufffdzlanda': 'Izlanda',
        '\ufffdekya': 'Cekya',
        'K\ufffdbr\ufffds': 'Kibris',
        'Norve\ufffd': 'Norvec',
        'S\ufffdrbistan': 'Sirbistan',
        'Y\ufffdd\ufffdzlar': 'Yildizlar',
        'F\ufffdtbol': 'Futbol',
        'Divisi\ufffdn': 'Division',
        'Rom\u01FCniei': 'Romaniei',
        'Brasileir\u01DCo': 'Brasileirao',
        'S\u01F8rie': 'Serie',
        'D\u01ECnya': 'Dunya',
    }
    
    for k, v in fixes.items():
        text = text.replace(k, v)
        
    # Standard Turkish to English replacements
    tr_map = {
        '\u00e7': 'c', '\u00c7': 'C',
        '\u011f': 'g', '\u011e': 'G',
        '\u0131': 'i', 'I': 'I', '\u0130': 'I',
        '\u00f6': 'o', '\u00d6': 'O',
        '\u015f': 's', '\u015e': 'S',
        '\u00fc': 'u', '\u00dc': 'U'
    }
    for tr, en in tr_map.items():
        text = text.replace(tr, en)
        
    text = text.replace('\ufffd', '')
    text = text.replace('\u01EC', 'u')
    return text

print("Cleaning DB...")
cur = conn.cursor()
cur.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar")
rows = cur.fetchall()

update_count = 0
for row in rows:
    rid, lig, ev, dep = row
    c_lig = clean_text(lig)
    c_ev = clean_text(ev)
    c_dep = clean_text(dep)
    
    if c_lig != lig or c_ev != ev or c_dep != dep:
        cur.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (c_lig, c_ev, c_dep, rid))
        update_count += 1

conn.commit()
conn.close()
print(f"Cleaned {update_count} rows!")
