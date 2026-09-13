import sqlite3

conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')
cur = conn.cursor()

fixes = {
    'IIngiltere': 'Ingiltere',
    'F\ufffdtbol': 'Futbol',
    'Brasileir\ufffdo': 'Brasileirao',
    'Divisi\ufffdn': 'Division',
    'Rom\ufffdniei': 'Romaniei',
    'S\ufffdrie': 'Serie'
}

cur.execute("SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar")
rows = cur.fetchall()

for row in rows:
    rid, lig, ev, dep = row
    
    n_lig = lig
    n_ev = ev
    n_dep = dep
    
    for k, v in fixes.items():
        if n_lig: n_lig = n_lig.replace(k, v)
        if n_ev: n_ev = n_ev.replace(k, v)
        if n_dep: n_dep = n_dep.replace(k, v)
        
    if n_lig != lig or n_ev != ev or n_dep != dep:
        cur.execute("UPDATE gecmis_maclar SET lig=?, ev_sahibi=?, deplasman=? WHERE id=?", (n_lig, n_ev, n_dep, rid))

conn.commit()
conn.close()
print('Fixes applied.')
