import os
import re

fpath = "artifacts/football-app/src/pages/TodayMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Make the layout simpler
new_header = """
      <header style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => (window.location.href = "/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "14px" }}>C</div>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)" }}>CRS <span style={{ fontWeight: "400", opacity: 0.7 }}>Analytics</span></span>
        </div>
        <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--card)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Link href="/bugun" style={{ backgroundColor: "var(--primary)", color: "#fff", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Bugün</Link>
          <Link href="/canli" style={{ color: "var(--muted-foreground)", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Canlı</Link>
          <Link href="/" style={{ color: "var(--muted-foreground)", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Manuel</Link>
        </div>
        <nav>
          <Link href="/admin" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Veritabanı</Link>
        </nav>
      </header>
"""
code = re.sub(r'<header.*?</header>', new_header, code, flags=re.DOTALL)

# Clean up hero
new_hero = """
            <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)", marginBottom: "8px" }}>Günün Programı</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Maçları inceleyin ve otomatik analiz edin.</p>
            </div>
"""
code = re.sub(r'<div className="form-hero">.*?</div>', new_hero, code, flags=re.DOTALL)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("TodayMatchesPage cleaned!")

