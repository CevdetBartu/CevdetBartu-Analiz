import sqlite3

c = sqlite3.connect("scripts/scraper/gecmis_maclar.db")

def fix_string(s):
    if not s: return s
    try:
        # Check if it has double encoded markers like Ä (0xC4) or Ã (0xC3)
        if chr(0xC4) in s or chr(0xC3) in s:
            # We encode it back to windows-1254 to get the raw bytes
            raw_bytes = s.encode("windows-1254")
            # Then decode as UTF-8
            return raw_bytes.decode("utf-8")
    except Exception:
        pass
    return s

matches = c.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar WHERE lig LIKE ? OR ev_sahibi LIKE ? OR deplasman LIKE ?", ("%"+chr(0xC4)+"%", "%"+chr(0xC4)+"%", "%"+chr(0xC4)+"%")).fetchall()

updated = 0
for row in matches:
    m_id, lig, ev, dep = row
    new_lig = fix_string(lig)
    new_ev = fix_string(ev)
    new_dep = fix_string(dep)
    
    if new_lig != lig or new_ev != ev or new_dep != dep:
        c.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (new_lig, new_ev, new_dep, m_id))
        updated += 1

matches3 = c.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar WHERE lig LIKE ? OR ev_sahibi LIKE ? OR deplasman LIKE ?", ("%"+chr(0xC3)+"%", "%"+chr(0xC3)+"%", "%"+chr(0xC3)+"%")).fetchall()

for row in matches3:
    m_id, lig, ev, dep = row
    new_lig = fix_string(lig)
    new_ev = fix_string(ev)
    new_dep = fix_string(dep)
    
    if new_lig != lig or new_ev != ev or new_dep != dep:
        c.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (new_lig, new_ev, new_dep, m_id))
        updated += 1

c.commit()
c.close()
print(f"Fixed {updated} rows!")

