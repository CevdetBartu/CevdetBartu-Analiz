import sqlite3
import datetime

db = sqlite3.connect('/var/www/scripts/scraper/gecmis_maclar.db')
matches = db.execute('SELECT id, lig, ev_sahibi, deplasman FROM gecmis_maclar WHERE oran_1 IS NOT NULL LIMIT 3').fetchall()

for idx, m in enumerate(matches):
    match_id = m[0]
    lig = m[1]
    ev = m[2]
    dep = m[3]
    
    title = f"{ev} - {dep} Maç Analizi ve İddaa Tahmini"
    content = f"<p>{lig} liginde harika bir mücadele.</p>"
    prediction = "Deplasman (MS2)" if idx == 0 else "Ev Sahibi (MS1) (Edge: +2.5%)"
    slug = f"{ev.lower().replace(' ', '-')}-{dep.lower().replace(' ', '-')}"
    category = lig
    excerpt = "Bu maçın tüm detaylı analizi ve value bahis önerisi..."
    read_time = "3 dk okuma"
    
    db.execute('INSERT INTO blog_posts (match_id, title, content, prediction, slug, category, excerpt, read_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
               (match_id, title, content, prediction, slug, category, excerpt, read_time))

db.commit()
print("Inserted 3 dummy posts on VPS.")
