import sqlite3

c = sqlite3.connect("scripts/scraper/gecmis_maclar.db")

def fix_string(s):
    if not s: return s
    try:
        # If the string contains replacement chars from bad decoding, we can't fix it easily, 
        # but if it contains double-encoded utf-8 (like Ä, Ã, Å), we can fix it.
        # Common markers for utf-8 double encoded to latin1/cp1254:
        # C3 (Ã), C4 (Ä), C5 (Å)
        if "\xc3" in s or "\xc4" in s or "\xc5" in s:
            # We encode it back to windows-1254 to get the raw bytes
            raw_bytes = s.encode("windows-1254")
            # Then decode as UTF-8
            return raw_bytes.decode("utf-8")
    except Exception:
        pass
    return s

matches = c.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar").fetchall()

updated = 0
for row in matches:
    m_id, lig, ev, dep = row
    new_lig = fix_string(lig)
    new_ev = fix_string(ev)
    new_dep = fix_string(dep)
    
    if new_lig != lig or new_ev != ev or new_dep != dep:
        c.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (new_lig, new_ev, new_dep, m_id))
        updated += 1

c.commit()
c.close()
print(f"Fixed {updated} rows across all data!")

