import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\Home.tsx"
content = """import React from "react";
import { Link } from "wouter";
import { DailyCouponWidget } from "../components/DailyCouponWidget";

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
          <div style={{ textAlign: "center", marginBottom: 56, marginTop: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", color: "#38bdf8", fontWeight: "bold", marginBottom: "20px" }}>
              <span>🚀 CRS ANALİZ SİSTEMİ & 134.500+ ÖKLİD YAPAY ZEKA MOTORU</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 20, background: "linear-gradient(135deg, #ffffff 10%, #38bdf8 50%, #6366f1 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
              GELİŞMİŞ YAPAY ZEKA DESTEKLİ<br />FUTBOL ANALİZ PORTALI
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "1.1rem", maxWidth: 740, margin: "0 auto 36px", lineHeight: 1.6 }}>
              İddaa büro oranları, zaman sönümlemeli Öklid benzerlik algoritmaları, CRS Analiz istatistik matrisleri ve canlı gol basınç endeksini kilitsiz ve ücretsiz olarak izleyin.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", backgroundColor: "#111827", border: "1px solid var(--border)", padding: "36px", borderRadius: "24px", marginTop: 32, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#38bdf8", marginBottom: 8 }}>134.500+</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Öklid AI Hafızası</div>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", marginBottom: 8 }}>1.095</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Kayıtlı Lig</div>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b", marginBottom: 8 }}>%100 Açık</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>CRS Analiz Matrisi</div>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#d946ef", marginBottom: 8 }}>0 ₺</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Tamamen Ücretsiz</div>
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
"""
with open(fpath, "w", encoding="utf-8") as f:
    f.write(content)
print("Home.tsx rewritten perfectly!")

