import os
import re

fpath = "artifacts/football-app/src/pages/LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Simplify Header
new_header = """
      <header style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => (window.location.href = "/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "14px" }}>C</div>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)" }}>CRS <span style={{ fontWeight: "400", opacity: 0.7 }}>Analytics</span></span>
        </div>
        <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--card)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Link href="/bugun" style={{ color: "var(--muted-foreground)", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Bugün</Link>
          <Link href="/canli" style={{ backgroundColor: "var(--primary)", color: "#fff", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Canlı</Link>
          <Link href="/" style={{ color: "var(--muted-foreground)", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Manuel</Link>
        </div>
        <nav>
          <Link href="/admin" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Veritabanı</Link>
        </nav>
      </header>
"""
code = re.sub(r'<header.*?</header>', new_header, code, flags=re.DOTALL)

# 2. Simplify Hero
new_hero = """
            <div style={{ padding: "30px 0 20px", textAlign: "center" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)", marginBottom: "8px" }}>Anlık Canlı Analiz</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Aktif karşılaşmaların hücum istatistiklerini (şut, korner, tempo) ve alarm durumlarını takip edin.</p>
            </div>
"""
code = re.sub(r'<div className="form-hero"[^>]*>.*?</div>', new_hero, code, flags=re.DOTALL)

# 3. Simplify Colors to match new theme
code = code.replace("#0f172a", "var(--background)")
code = code.replace("#1e293b", "var(--border)")
code = code.replace("#334155", "var(--border)")
code = code.replace("#0e1520", "var(--card)")
code = code.replace("#0c1218", "transparent")
code = code.replace("#141e28", "var(--border)")
code = code.replace("#2563eb", "var(--primary)")
code = code.replace("#6366f1", "var(--primary)") # AI button color
code = code.replace("#38bdf8", "var(--foreground)")
code = code.replace("#e2e8f0", "var(--foreground)")
code = code.replace("#f8fafc", "var(--foreground)")
code = code.replace("rgba(255,255,255,0.05)", "var(--border)")
code = code.replace("rgba(255,255,255,0.03)", "transparent")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Re-applied clean styles to LiveMatchesPage!")

