import os

fpath = os.path.join("artifacts", "football-app", "src", "pages", "AdminPage.tsx")
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

import re

# Bul: {/* 📘 Kullanım Kılavuzu ... */} ... <div className="admin-card admin-card-info"> ... </div>
# Ve değiştir.

replacement = """        {/* LİGLER LİSTESİ */}
        {stats?.db?.ligler && stats.db.ligler.length > 0 && (
          <div className="admin-card">
            <h2 className="admin-card-title">Veritabanındaki Tüm Ligler ({stats.db.ligler.length})</h2>
            <div style={{
              display: "flex", 
              flexWrap: "wrap", 
              gap: "6px", 
              maxHeight: "300px", 
              overflowY: "auto", 
              padding: "12px",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              border: "1px solid #1e293b"
            }}>
              {stats.db.ligler.map((l: any, i: number) => (
                <span key={i} style={{
                  fontSize: "11px",
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {l.lig} <span style={{color: "#64748b", fontSize: "10px", fontWeight: "bold"}}>{l.mac}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 📘 Kullanım Kılavuzu */}
        <div className="admin-card admin-card-info">
          <h2 className="admin-card-title">Sistem Nasıl Çalışır? (Yeni Nesil Mackolik Altyapısı)</h2>
          <ol className="admin-steps">
            <li><strong>Tamamen Otomatik:</strong> Eski manuel SofaScore/Football-Data taramaları çöpe atıldı. Sistem arka planda Mackolik CRON takvimiyle otomatik çalışır.</li>
            <li><strong>Tarihsel Madencilik:</strong> Dünden başlayarak 2021 yılına kadar geriye dönük iddaa oranlı tüm maçlar (oranlar, alt/üst, devre/maç skorları) 10 saniye aralıklarla çekilir.</li>
            <li><strong>Canlı Akış:</strong> Her 5 dakikada bir güncel maçların kapanış oranları ve gece yarısı ertesi günün bülteni otomatik güncellenir.</li>
            <li><strong>Güvenli:</strong> Sistem IP banlarına (Cloudflare WAF) karşı insan simülasyonu ve limitli isteklerle çalışır.</li>
            <li>Tüm veriler <code>scripts/scraper/gecmis_maclar.db</code> dosyasında güvendedir.</li>
          </ol>
        </div>"""

new_code = re.sub(r"\{\/\* 📘 Kullanım Kılavuzu.*?\<\/div\>", replacement, code, flags=re.DOTALL)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(new_code)

