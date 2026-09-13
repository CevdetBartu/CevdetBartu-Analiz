import sqlite3

c = sqlite3.connect("scripts/scraper/gecmis_maclar.db")

def fix_string(s):
    if not s: return s
    try:
        if "\xc3" in s or "\xc4" in s or "\xc5" in s:
            raw_bytes = s.encode("windows-1254")
            return raw_bytes.decode("utf-8")
    except Exception:
        pass
    return s

matches = c.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar").fetchall()

updated = 0
deleted = 0
for row in matches:
    m_id, lig, ev, dep = row
    new_lig = fix_string(lig)
    new_ev = fix_string(ev)
    new_dep = fix_string(dep)
    
    if new_lig != lig or new_ev != ev or new_dep != dep:
        try:
            c.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (new_lig, new_ev, new_dep, m_id))
            updated += 1
        except sqlite3.IntegrityError:
            # If it already exists, just delete this duplicate corrupted one!
            c.execute("DELETE FROM gecmis_maclar WHERE id=?", (m_id,))
            deleted += 1

c.commit()
c.close()
print(f"Fixed {updated} rows, deleted {deleted} duplicate corrupted rows!")

