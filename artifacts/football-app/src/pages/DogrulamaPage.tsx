import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Prediction {
  id: string;
  tarih: string;
  saat: string;
  lig: string;
  ev_sahibi: string;
  deplasman: string;
  tahmin: string;
  olasilik: number;
  guvenlik: 'YUKSEK' | 'ORTA' | 'DUSUK';
  guvenlik_skoru: number;
  skor: string;
  durum: 'PENDING' | 'WON' | 'LOST';
}

interface Stats {
  total: number;
  won: number;
  rate: number;
}

interface ApiResponse {
  ok: boolean;
  stats: {
    btts: Stats;
    over: Stats;
    ms: Stats;
    overall: Stats;
  };
  statsV1: {
    btts: Stats;
    over: Stats;
    ms: Stats;
    overall: Stats;
  };
  predictions: Prediction[];
}

export default function DogrulamaPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'KG_VAR' | 'OVER_25' | 'MS' | 'WON' | 'LOST' | 'PENDING'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [sortByConfidence, setSortByConfidence] = useState<'NONE' | 'DESC' | 'ASC'>('NONE');

  async function fetchPredictions() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(`${BASE}/api/dogrulama/predictions`);
      if (!r.ok) throw new Error('API yanıtı alınamadı.');
      const res = await r.json();
      if (!res.ok) throw new Error(res.message || 'Veri yüklenemedi.');
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Bilinmeyen bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPredictions();
    setRefreshing(false);
  };

  // Filtered Predictions
  const filteredPredictions = data?.predictions.filter((p) => {
    if (filter === 'KG_VAR') return p.tahmin === 'KG VAR';
    if (filter === 'OVER_25') return p.tahmin === '2.5 ÜST';
    if (filter === 'MS') return p.tahmin === 'MS 1' || p.tahmin === 'MS 2' || p.tahmin === 'MS X';
    if (filter === 'WON') return p.durum === 'WON';
    if (filter === 'LOST') return p.durum === 'LOST';
    if (filter === 'PENDING') return p.durum === 'PENDING';
    return true;
  }) || [];

  const toggleSortConfidence = () => {
    setSortByConfidence((prev) => {
      if (prev === 'NONE') return 'DESC';
      if (prev === 'DESC') return 'ASC';
      return 'NONE';
    });
  };

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortByConfidence === 'DESC') {
      return b.guvenlik_skoru - a.guvenlik_skoru;
    } else if (sortByConfidence === 'ASC') {
      return a.guvenlik_skoru - b.guvenlik_skoru;
    }
    return 0;
  });

  return (
    <div className="app-container">
      {/* Top Nav */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">CevdetBartu Analiz</span>
        </div>
        <div className="sport-tabs">
          <Link href="/" className="sport-tab">⚽ Futbol</Link>
          <Link href="/canli" className="sport-tab">📺 Canlı Analiz</Link>
          <Link href="/dogrulama" className="sport-tab active">📊 Tahmin Doğrulama</Link>
        </div>
        <nav className="app-nav">
          <Link href="/" className="nav-btn" style={{ textDecoration: 'none' }}>← Analiz</Link>
          <Link href="/bugun" className="nav-btn" style={{ textDecoration: 'none' }}>📅 Bugünün Maçları</Link>
          <Link href="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>⚙️ Veri Havuzu</Link>
        </nav>
      </header>

      <main className="app-main" style={{ maxWidth: 1350, margin: '0 auto', padding: '20px 10px' }}>
        {/* Hero Section */}
        <div className="form-hero" style={{ marginBottom: 30 }}>
          <h1 className="form-hero-title">📈 Tahmin Doğrulama Paneli</h1>
          <p className="form-hero-sub">
            Son 24 saat ve önümüzdeki 48 saatin en az <strong>%80 ihtimalle</strong> ve yüksek güvenilirlikle eşleşen maçlarının başarı karnesi
          </p>
          <button 
            onClick={handleRefresh} 
            disabled={loading || refreshing} 
            className="submit-btn" 
            style={{ width: 'auto', padding: '10px 24px', fontSize: '0.88rem', margin: '15px auto 0 auto', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {refreshing ? '🔄 Güncelleniyor...' : '🔄 Sonuçları ve Verileri Yenile'}
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && !refreshing && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px auto', width: 45, height: 45 }}></div>
            <p style={{ color: '#aec6e8' }}>48 saatlik bülten taranıyor ve matematiksel doğrulama çalıştırılıyor...</p>
          </div>
        )}

        {error && (
          <div className="admin-alert-error" style={{ marginBottom: 30, textAlign: 'center' }}>
            <strong>Hata:</strong> {error}
            <button onClick={fetchPredictions} className="nav-btn" style={{ marginLeft: 15, padding: '4px 12px', background: '#3b181a', border: '1px solid #ff4d4d', color: '#ff4d4d', fontSize: '0.78rem' }}>Tekrar Dene</button>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Model Comparison Stats Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <h3 style={{ color: '#aec6e8', fontSize: '1rem', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚖️ Matematiksel Model Karşılaştırmalı Başarı Raporu (Model V1 vs Model V2)
              </h3>
              <p style={{ color: '#8ab', fontSize: '0.82rem', marginBottom: 15 }}>
                Aşağıdaki tabloda, son 24 saat ve önümüzdeki 48 saatlik bültendeki aynı maç havuzu üzerinde <strong>Eski Matematiksel Model (V1)</strong> ile <strong>Yeni Matematiksel Model (V2)</strong> başarı oranlarının karşılaştırması gösterilmektedir.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#aec6e8' }}>
                      <th style={{ padding: '10px 15px' }}>Tahmin Seçeneği</th>
                      <th style={{ padding: '10px 15px', color: '#ef4444' }}>❌ Eski Model (V1) Başarısı</th>
                      <th style={{ padding: '10px 15px', color: '#22c55e' }}>🟢 Yeni Model (V2) Başarısı</th>
                      <th style={{ padding: '10px 15px', color: '#3b82f6' }}>📈 Başarı Artışı (Fark)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 600, color: '#fff' }}>⚽ KG VAR</td>
                      <td style={{ padding: '12px 15px', color: '#ef4444' }}>%{data.statsV1.btts.rate} ({data.statsV1.btts.won}/{data.statsV1.btts.total})</td>
                      <td style={{ padding: '12px 15px', color: '#22c55e', fontWeight: 600 }}>%{data.stats.btts.rate} ({data.stats.btts.won}/{data.stats.btts.total})</td>
                      <td style={{ padding: '12px 15px', color: '#3b82f6', fontWeight: 600 }}>
                        {data.stats.btts.rate >= data.statsV1.btts.rate ? `+${(data.stats.btts.rate - data.statsV1.btts.rate).toFixed(2)}%` : `${(data.stats.btts.rate - data.statsV1.btts.rate).toFixed(2)}%`}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 600, color: '#fff' }}>🔥 2.5 ÜST</td>
                      <td style={{ padding: '12px 15px', color: '#ef4444' }}>%{data.statsV1.over.rate} ({data.statsV1.over.won}/{data.statsV1.over.total})</td>
                      <td style={{ padding: '12px 15px', color: '#22c55e', fontWeight: 600 }}>%{data.stats.over.rate} ({data.stats.over.won}/{data.stats.over.total})</td>
                      <td style={{ padding: '12px 15px', color: '#3b82f6', fontWeight: 600 }}>
                        {data.stats.over.rate >= data.statsV1.over.rate ? `+${(data.stats.over.rate - data.statsV1.over.rate).toFixed(2)}%` : `${(data.stats.over.rate - data.statsV1.over.rate).toFixed(2)}%`}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 600, color: '#fff' }}>🏆 MAÇ SONUCU (1/X/2)</td>
                      <td style={{ padding: '12px 15px', color: '#ef4444' }}>%{data.statsV1.ms.rate} ({data.statsV1.ms.won}/{data.statsV1.ms.total})</td>
                      <td style={{ padding: '12px 15px', color: '#22c55e', fontWeight: 600 }}>%{data.stats.ms.rate} ({data.stats.ms.won}/{data.stats.ms.total})</td>
                      <td style={{ padding: '12px 15px', color: '#3b82f6', fontWeight: 600 }}>
                        {data.stats.ms.rate >= data.statsV1.ms.rate ? `+${(data.stats.ms.rate - data.statsV1.ms.rate).toFixed(2)}%` : `${(data.stats.ms.rate - data.statsV1.ms.rate).toFixed(2)}%`}
                      </td>
                    </tr>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 600, color: '#f59e0b' }}>👑 GENEL ORTALAMA</td>
                      <td style={{ padding: '12px 15px', color: '#ef4444', fontWeight: 600 }}>%{data.statsV1.overall.rate} ({data.statsV1.overall.won}/{data.statsV1.overall.total})</td>
                      <td style={{ padding: '12px 15px', color: '#22c55e', fontWeight: 700 }}>%{data.stats.overall.rate} ({data.stats.overall.won}/{data.stats.overall.total})</td>
                      <td style={{ padding: '12px 15px', color: '#f59e0b', fontWeight: 700 }}>
                        {data.stats.overall.rate >= data.statsV1.overall.rate ? `+${(data.stats.overall.rate - data.statsV1.overall.rate).toFixed(2)}%` : `${(data.stats.overall.rate - data.statsV1.overall.rate).toFixed(2)}%`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 35 }}>
              
              {/* KG VAR card */}
              <div style={{ background: 'rgba(20, 30, 48, 0.75)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ fontSize: '0.88rem', color: '#aec6e8', fontWeight: 600 }}>⚽ KG VAR BAŞARISI</span>
                  <span style={{ fontSize: '0.78rem', background: 'rgba(100,200,100,0.1)', color: '#5dc85d', padding: '2px 8px', borderRadius: 20 }}>Model V2</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  %{data.stats.btts.rate}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8ab', marginBottom: 15 }}>
                  Toplam tutan maç: <strong>{data.stats.btts.won} / {data.stats.btts.total}</strong>
                </div>
                <div style={{ height: 6, background: '#1c2635', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.stats.btts.rate}%`, background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: 3 }}></div>
                </div>
              </div>

              {/* 2.5 UST card */}
              <div style={{ background: 'rgba(20, 30, 48, 0.75)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ fontSize: '0.88rem', color: '#aec6e8', fontWeight: 600 }}>🔥 2.5 ÜST BAŞARISI</span>
                  <span style={{ fontSize: '0.78rem', background: 'rgba(100,200,100,0.1)', color: '#5dc85d', padding: '2px 8px', borderRadius: 20 }}>Model V2</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  %{data.stats.over.rate}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8ab', marginBottom: 15 }}>
                  Toplam tutan maç: <strong>{data.stats.over.won} / {data.stats.over.total}</strong>
                </div>
                <div style={{ height: 6, background: '#1c2635', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.stats.over.rate}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: 3 }}></div>
                </div>
              </div>

              {/* MS card */}
              <div style={{ background: 'rgba(20, 30, 48, 0.75)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ fontSize: '0.88rem', color: '#aec6e8', fontWeight: 600 }}>🏆 MAÇ SONUCU BAŞARISI</span>
                  <span style={{ fontSize: '0.78rem', background: 'rgba(100,200,100,0.1)', color: '#5dc85d', padding: '2px 8px', borderRadius: 20 }}>Model V2</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  %{data.stats.ms.rate}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8ab', marginBottom: 15 }}>
                  Toplam tutan maç: <strong>{data.stats.ms.won} / {data.stats.ms.total}</strong>
                </div>
                <div style={{ height: 6, background: '#1c2635', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.stats.ms.rate}%`, background: 'linear-gradient(90deg, #f59e0b, #eab308)', borderRadius: 3 }}></div>
                </div>
              </div>

              {/* OVERALL card */}
              <div style={{ background: 'rgba(20, 30, 48, 0.75)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ fontSize: '0.88rem', color: '#aec6e8', fontWeight: 600 }}>👑 GENEL BAŞARI</span>
                  <span style={{ fontSize: '0.78rem', background: 'rgba(255,165,0,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20 }}>Toplam</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  %{data.stats.overall.rate}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8ab', marginBottom: 15 }}>
                  Genel başarılı tahmin: <strong>{data.stats.overall.won} / {data.stats.overall.total}</strong>
                </div>
                <div style={{ height: 6, background: '#1c2635', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.stats.overall.rate}%`, background: 'linear-gradient(90deg, #a855f7, #8b5cf6)', borderRadius: 3 }}></div>
                </div>
              </div>

            </div>

            {/* Filter Tabs */}
            <div className="admin-tabs" style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setFilter('ALL')} className={`admin-tab ${filter === 'ALL' ? 'active' : ''}`}>Tüm Tahminler ({data.predictions.length})</button>
              <button onClick={() => setFilter('KG_VAR')} className={`admin-tab ${filter === 'KG_VAR' ? 'active' : ''}`}>KG VAR</button>
              <button onClick={() => setFilter('OVER_25')} className={`admin-tab ${filter === 'OVER_25' ? 'active' : ''}`}>2.5 ÜST</button>
              <button onClick={() => setFilter('MS')} className={`admin-tab ${filter === 'MS' ? 'active' : ''}`}>MAÇ SONUCU</button>
              <button onClick={() => setFilter('WON')} className={`admin-tab ${filter === 'WON' ? 'active' : ''}`} style={{ borderLeft: '3px solid #22c55e' }}>Kazananlar ({data.predictions.filter(p => p.durum === 'WON').length})</button>
              <button onClick={() => setFilter('LOST')} className={`admin-tab ${filter === 'LOST' ? 'active' : ''}`} style={{ borderLeft: '3px solid #ef4444' }}>Kaybedenler ({data.predictions.filter(p => p.durum === 'LOST').length})</button>
              <button onClick={() => setFilter('PENDING')} className={`admin-tab ${filter === 'PENDING' ? 'active' : ''}`} style={{ borderLeft: '3px solid #888' }}>Bekleyenler ({data.predictions.filter(p => p.durum === 'PENDING').length})</button>
            </div>

            {/* Table Container */}
            <div className="table-container" style={{ background: 'rgba(10, 17, 28, 0.65)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(28, 38, 53, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Tarih / Saat</th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Lig</th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Takımlar</th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Tahmin</th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Hesaplanan İhtimal</th>
                    <th 
                      onClick={toggleSortConfidence} 
                      style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600, cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#aec6e8')}
                    >
                      Güven {sortByConfidence === 'DESC' ? '▼' : sortByConfidence === 'ASC' ? '▲' : '⇅'}
                    </th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Skor</th>
                    <th style={{ padding: '16px 20px', color: '#aec6e8', fontWeight: 600 }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPredictions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '30px 20px', textAlign: 'center', color: '#8ab' }}>
                        Seçilen filtreye uygun eşleşme bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    sortedPredictions.map((p) => {
                      let statusBadge = (
                        <span style={{ display: 'inline-block', background: 'rgba(128,128,128,0.1)', color: '#888', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>BEKLİYOR</span>
                      );
                      if (p.durum === 'WON') {
                        statusBadge = (
                          <span style={{ display: 'inline-block', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>KAZANDI</span>
                        );
                      } else if (p.durum === 'LOST') {
                        statusBadge = (
                          <span style={{ display: 'inline-block', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>KAYBETTİ</span>
                        );
                      }

                      let confidenceBadge = (
                        <span style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>🔴 Düşük ({p.guvenlik_skoru}%)</span>
                      );
                      if (p.guvenlik === 'YUKSEK') {
                        confidenceBadge = (
                          <span style={{ color: '#22c55e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>🟢 Yüksek ({p.guvenlik_skoru}%)</span>
                        );
                      } else if (p.guvenlik === 'ORTA') {
                        confidenceBadge = (
                          <span style={{ color: '#eab308', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>🟡 Orta ({p.guvenlik_skoru}%)</span>
                        );
                      }

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: p.durum === 'WON' ? 'rgba(34,197,94,0.01)' : p.durum === 'LOST' ? 'rgba(239,68,68,0.01)' : 'transparent', transition: 'background 0.2s' }}>
                          <td style={{ padding: '14px 20px', color: '#fff' }}>
                            {p.tarih} <span style={{ color: '#8ab', fontSize: '0.78rem', marginLeft: 4 }}>{p.saat}</span>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#aec6e8' }}>{p.lig}</td>
                          <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 600 }}>
                            {p.ev_sahibi} <span style={{ color: '#8ab', fontWeight: 4, margin: '0 4px' }}>-</span> {p.deplasman}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ fontWeight: 600, color: p.tahmin === '2.5 ÜST' ? '#60a5fa' : '#34d399' }}>{p.tahmin}</span>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.92rem', fontWeight: 700 }}>
                            %{p.olasilik}
                          </td>
                          <td style={{ padding: '14px 20px' }}>{confidenceBadge}</td>
                          <td style={{ padding: '14px 20px', color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>{p.skor}</td>
                          <td style={{ padding: '14px 20px' }}>{statusBadge}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
