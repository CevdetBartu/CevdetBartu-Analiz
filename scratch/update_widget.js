const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "football-app", "src", "components", "DailyCouponWidget.tsx");

const code = `import React, { useState, useEffect } from "react";
const BASE = import.meta.env.BASE_URL.replace(/\\\\/$/, "");

export function DailyCouponWidget() {
  const [coupons, setCoupons] = useState<{iy15: any[], ust25: any[], karma: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"karma" | "ust25" | "iy15">("karma");

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(\`\${BASE}/api/coupon-of-the-day\`);
        if (!res.ok) throw new Error("Günün kuponu çekilemedi.");
        const data = await res.json();
        // If the old API format is cached (array), map it to karma temporarily to prevent crashes
        if (Array.isArray(data)) {
            setCoupons({ karma: data, ust25: [], iy15: [] });
        } else {
            setCoupons(data);
        }
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
        <div style={{
          border: "3px solid rgba(56, 189, 248, 0.1)",
          width: "30px", height: "30px", borderRadius: "50%",
          borderLeftColor: "#38bdf8", animation: "spin 1s linear infinite",
          margin: "0 auto 16px auto"
        }}></div>
        Günün kuponları yapay zeka tarafından hesaplanıyor... (15-20sn sürebilir)
      </div>
    );
  }

  if (error || !coupons) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.2)" }}>
        {error || "Kupon verisi alınamadı."}
      </div>
    );
  }

  const currentCoupon = coupons[activeTab] || [];

  return (
    <div style={{
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
        <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔥</span> GÜNÜN YZ KUPONLARI
        </h2>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 600, backgroundColor: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "12px" }}>
          %75+ İSABET
        </span>
      </div>
      
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", padding: "16px 24px 0 24px", background: "#0f172a", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
        {[
          { id: "karma", label: "🌟 KG/2.5 Karma" },
          { id: "ust25", label: "⚽ 2.5 Üst" },
          { id: "iy15", label: "⚡ İY 1.5 Üst" }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{ 
              padding: "10px 16px", 
              borderRadius: "8px 8px 0 0", 
              background: activeTab === t.id ? "#1e293b" : "transparent", 
              color: activeTab === t.id ? "#38bdf8" : "#94a3b8", 
              border: "1px solid",
              borderColor: activeTab === t.id ? "#1e293b" : "transparent",
              borderBottom: "none",
              cursor: "pointer", 
              fontWeight: 700,
              fontSize: "14px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px", background: "#1e293b" }}>
        {currentCoupon.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", background: "#0f172a", borderRadius: "12px" }}>
            Şu an için bu kupon türünde (Min %75 başarı, Min 3 Referans) uyan banko maç bulunamadı.
          </div>
        ) : (
          currentCoupon.map((item, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#0f172a",
              borderRadius: "12px",
              borderLeft: \`4px solid \${activeTab === "iy15" ? "#eab308" : activeTab === "ust25" ? "#10b981" : "#3b82f6"}\`
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
                <div style={{ fontSize: "18px", fontWeight: 800, color: activeTab === "iy15" ? "#eab308" : activeTab === "ust25" ? "#10b981" : "#3b82f6", marginBottom: "2px" }}>
                  {item.prediction}
                </div>
                <div style={{ fontSize: "12px", color: "#f8fafc", fontWeight: 700, backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                  %{item.probability} GÜVEN
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(fpath, code, "utf-8");
console.log("Updated DailyCouponWidget.tsx to support 3 tabs!");

