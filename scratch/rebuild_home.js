const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "football-app", "src", "pages", "Home.tsx");

const newCode = `import React from \x27react\x27;
import { Link } from \x27wouter\x27;
import { DailyCouponWidget } from \x27../components/DailyCouponWidget\x27;

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">⚽</div>
          Match Data Hub
        </div>
        <nav className="header-nav">
          <Link href="/bulletin" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Bülten (Mackolik)</Link>
          <Link href="/live" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="live-dot" style={{ width: 8, height: 8, backgroundColor: "#ef4444", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #ef4444" }}></span>
            Canlı Maçlar
          </Link>
          <Link href="/stats" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Algoritma Başarısı</Link>
          <Link href="/admin" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Veritabanı</Link>
        </nav>
      </header>

      <main className="app-main">
        <div className="form-container">
          <div style={{ textAlign: \x27center\x27, marginBottom: 56, marginTop: 32 }}>
            <div style={{ display: \x27inline-flex\x27, alignItems: \x27center\x27, gap: \x278px\x27, backgroundColor: \x27rgba(56, 189, 248, 0.1)\x27, border: \x271px solid rgba(56, 189, 248, 0.2)\x27, padding: \x276px 16px\x27, borderRadius: \x2720px\x27, fontSize: \x2712px\x27, color: \x27#38bdf8\x27, fontWeight: \x27bold\x27, marginBottom: \x2720px\x27 }}>
              <span>🚀 CRS ANALİZ SİSTEMİ & 134.500+ ÖKLİD YAPAY ZEKA MOTORU</span>
            </div>
            <h1 style={{ fontSize: \x27clamp(2.2rem, 5vw, 3.8rem)\x27, fontWeight: 900, lineHeight: 1.15, marginBottom: 20, background: \x27linear-gradient(135deg, #ffffff 10%, #38bdf8 50%, #6366f1 90%)\x27, WebkitBackgroundClip: \x27text\x27, WebkitTextFillColor: \x27transparent\x27, letterSpacing: \x27-0.02em\x27 }}>
              GELİŞMİŞ YAPAY ZEKA DESTEKLİ<br />FUTBOL ANALİZ PORTALI
            </h1>
            <p style={{ color: \x27var(--muted-foreground)\x27, fontSize: \x271.1rem\x27, maxWidth: 740, margin: \x270 auto 36px\x27, lineHeight: 1.6 }}>
              İddaa büro oranları, zaman sönümlemeli Öklid benzerlik algoritmaları, CRS Analiz istatistik matrisleri ve canlı gol basınç endeksini kilitsiz ve ücretsiz olarak izleyin.
            </p>
            
            <div style={{ display: \x27grid\x27, gridTemplateColumns: \x27repeat(auto-fit, minmax(200px, 1fr))\x27, gap: \x2724px\x27, backgroundColor: \x27#111827\x27, border: \x271px solid var(--border)\x27, padding: \x2736px\x27, borderRadius: \x2724px\x27, marginTop: 32, maxWidth: 900, marginLeft: \x27auto\x27, marginRight: \x27auto\x27 }}>
              <div style={{ padding: \x2716px\x27 }}>
                <div style={{ fontSize: \x272.5rem\x27, fontWeight: \x27bold\x27, color: \x27#38bdf8\x27, marginBottom: 8 }}>134.500+</div>
                <div style={{ color: \x27var(--muted-foreground)\x27, fontSize: \x270.9rem\x27 }}>Öklid AI Hafızası</div>
              </div>
              <div style={{ padding: \x2716px\x27 }}>
                <div style={{ fontSize: \x272.5rem\x27, fontWeight: \x27bold\x27, color: \x27#10b981\x27, marginBottom: 8 }}>1.095</div>
                <div style={{ color: \x27var(--muted-foreground)\x27, fontSize: \x270.9rem\x27 }}>Kayıtlı Lig</div>
              </div>
              <div style={{ padding: \x2716px\x27 }}>
                <div style={{ fontSize: \x272.5rem\x27, fontWeight: \x27bold\x27, color: \x27#f59e0b\x27, marginBottom: 8 }}>%100 Açık</div>
                <div style={{ color: \x27var(--muted-foreground)\x27, fontSize: \x270.9rem\x27 }}>CRS Analiz Matrisi</div>
              </div>
              <div style={{ padding: \x2716px\x27 }}>
                <div style={{ fontSize: \x272.5rem\x27, fontWeight: \x27bold\x27, color: \x27#d946ef\x27, marginBottom: 8 }}>0 ₺</div>
                <div style={{ color: \x27var(--muted-foreground)\x27, fontSize: \x270.9rem\x27 }}>Tamamen Ücretsiz</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "40px", marginBottom: "40px" }}>
            <DailyCouponWidget />
          </div>
          
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync(fpath, newCode, "utf-8");
console.log("Home.tsx rewritten cleanly!");

