import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\components\DailyCouponWidget.tsx"
code = """import React, { useState, useEffect } from "react";
const BASE = import.meta.env.BASE_URL.replace(/\\/$/, "");

export function DailyCouponWidget() {
  const [coupon, setCoupon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`${BASE}/api/coupon-of-the-day`);
        if (!res.ok) throw new Error("Günün kuponu çekilemedi.");
        const data = await res.json();
        setCoupon(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupon();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
        Günün kuponu yapay zeka tarafından hesaplanıyor...
      </div>
    );
  }

  if (error || coupon.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
        Şu an için kriterlere (Min %75 başarı, Min 3 Referans) uyan banko maç bulunamadı.
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#0f172a",
      borderRadius: "16px",
      border: "1px solid #1e293b",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    }}>
      <div style={{
        background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <h2 style={{ margin: 0, color: "#fff", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔥</span> GÜNÜN YZ BANKO KUPONU
        </h2>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 600, backgroundColor: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "12px" }}>
          %75+ İSABET
        </span>
      </div>
      
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {coupon.map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            borderLeft: "4px solid #3b82f6"
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                {item.time} | {item.league}
              </div>
              <div style={{ fontSize: "15px", color: "#f8fafc", fontWeight: 700 }}>
                {item.match}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                {item.totalMatches} Geçmiş Eşleşme
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#10b981", marginBottom: "2px" }}>
                {item.prediction}
              </div>
              <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700, backgroundColor: "rgba(56, 189, 248, 0.1)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                %{item.probability} GÜVEN
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Widget created!")

