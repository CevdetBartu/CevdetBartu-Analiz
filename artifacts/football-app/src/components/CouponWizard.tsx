import React, { useState } from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const BET_TYPES = [
  { id: 'ms1', label: 'Maç Sonucu 1' },
  { id: 'ms2', label: 'Maç Sonucu 2' },
  { id: 'kg_var', label: 'KG Var' },
  { id: 'ust_25', label: '2.5 Gol Üstü' },
  { id: 'ust_35', label: '3.5 Gol Üstü' },
  { id: 'ust_45', label: '4.5 Gol Üstü' },
  { id: 'gol_6_plus', label: '6+ Gol' },
  { id: 'iy_ms_1_2', label: 'İlk Yarı 1 / Maç Sonucu 2 (1/2)' },
  { id: 'iy_ms_2_1', label: 'İlk Yarı 2 / Maç Sonucu 1 (2/1)' }
];

export function CouponWizard() {
  const [selectedType, setSelectedType] = useState('ust_25');
  const [count, setCount] = useState(3);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoupon = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/coupon/wizard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betType: selectedType, count })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>🧙‍♂️</span>
        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem' }}>Kupon Sihirbazı (Tamamen Geçmiş Maç Tablolarına Dayalı)</h2>
      </div>
      
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px' }}>
        Bugünün bültenindeki tüm açık maçları saniyeler içinde tarar ve seçtiğiniz bahis türü için <strong>%100 matematiksel benzerlik tablolarından</strong> en yüksek orana sahip maçları bulur. Kurgu veya yapay zeka halüsinasyonu içermez!
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 'bold' }}>Bahis Türü Seçin:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: '10px 16px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none', width: '250px' }}
          >
            {BET_TYPES.map(bt => (
              <option key={bt.id} value={bt.id}>{bt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 'bold' }}>Maç Sayısı:</label>
          <select 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ padding: '10px 16px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none', width: '120px' }}
          >
            <option value={2}>2 Maç</option>
            <option value={3}>3 Maç</option>
            <option value={4}>4 Maç</option>
            <option value={5}>5 Maç</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            onClick={generateCoupon} 
            disabled={loading}
            style={{ 
              padding: '10px 24px', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              border: 'none', 
              color: '#fff', 
              borderRadius: '8px', 
              cursor: loading ? 'wait' : 'pointer', 
              fontWeight: 'bold', 
              fontSize: '1rem',
              height: '44px'
            }}
          >
            {loading ? 'Bülten Taranıyor...' : '✨ Kuponu Hazırla'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>Hata: {error}</div>}

      {matches.length > 0 && (
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px dashed #38bdf8' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8' }}>🎯 Üretilen Kupon (En Yüksek İhtimalden En Düşüğe)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matches.map((m, i) => (
              <div key={m.match_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>{m.saat} | {m.lig}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem' }}>{m.ev_sahibi} - {m.deplasman}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#10b981', fontWeight: 900, fontSize: '1.2rem', marginBottom: '4px' }}>{m.selection}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    Olasılık: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>%{m.probability}</span> 
                    {' | '} Oran: <strong>{m.oran}</strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>Referans Alınan Maç: {m.refCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}