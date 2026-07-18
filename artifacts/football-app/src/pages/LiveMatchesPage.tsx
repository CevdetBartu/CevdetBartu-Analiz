import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface LiveStats {
  possession_h: number;
  possession_a: number;
  shots_target_h: number;
  shots_target_a: number;
  shots_off_h: number;
  shots_off_a: number;
  corners_h: number;
  corners_a: number;
  yellow_h: number;
  yellow_a: number;
  red_h: number;
  red_a: number;
  fouls_h: number;
  fouls_a: number;
}

interface LiveMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  score_h: number;
  score_a: number;
  score_ht_h: number;
  score_ht_a: number;
  minute: number | null;
  status: string;
  status_description: string;
  stats: LiveStats;
  pressure: {
    home: number;
    away: number;
    tempo: number;
  };
  status_color: {
    home: string;
    away: string;
  };
  pre_match_odds: {
    "1": number | null;
    "X": number | null;
    "2": number | null;
  };
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function LiveMatchesPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch(`${BASE}/api/live-matches`);
      if (!response.ok) {
        throw new Error('Canlı maç verileri çekilemedi.');
      }
      const data = await response.json();
      setMatches(data);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const filtered = matches.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q) ||
      m.league.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q)
    );
  });

  // Group by league
  const byLeague: Record<string, LiveMatch[]> = {};
  for (const m of filtered) {
    const key = m.country ? `${m.country} - ${m.league}` : m.league;
    if (!byLeague[key]) byLeague[key] = [];
    byLeague[key].push(m);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">CevdetBartu Analiz</span>
        </div>
        <div className="sport-tabs">
          <Link href="/" className="sport-tab">⚽ Futbol</Link>
          <Link href="/canli" className="sport-tab active">
            <span className="live-dot" style={{ display: 'inline-block', width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%', marginRight: 6, animate: 'pulse 1.5s infinite' }}></span>
            📺 Canlı Analiz
          </Link>
        </div>
        <nav className="app-nav">
          <Link href="/" className="nav-btn" style={{ textDecoration: 'none' }}>← Analiz</Link>
          <Link href="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>⚙️ Veri Havuzu</Link>
          <Link href="/bugun" className="nav-btn" style={{ textDecoration: 'none' }}>📅 Bülten</Link>
        </nav>
      </header>

      <main className="app-main">
        <div style={{ maxWidth: 1350, margin: '0 auto' }}>
          {/* Hero */}
          <div className="form-hero" style={{ marginBottom: 24 }}>
            <h1 className="form-hero-title">Anlık Canlı Analiz & Yapay Zekâ</h1>
            <p className="form-hero-sub">
              Dünyadaki aktif futbol karşılaşmalarının şut, korner, tehlikeli atak verilerini ve gol basınç endeksini anlık takip edin.
              Gelişmiş <strong>AI</strong> butonuyla maçın pre-match oranlarına göre geçmiş benzer maçların dashboard sayfasına tek tıkla gidin.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Takım veya lig ara..."
              className="form-input"
              style={{ width: '100%', maxWidth: 400 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Color Status Legend */}
          <div style={{
            backgroundColor: '#0d1527',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
              <span style={{ color: '#94a3b8' }}><strong style={{ color: '#22c55e' }}>Yeşil:</strong> Gol / Korner ihtimali çok yüksek</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
              <span style={{ color: '#94a3b8' }}><strong style={{ color: '#3b82f6' }}>Mavi:</strong> Baskı kuruyor, gol / korner yakında</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#eab308', borderRadius: '50%' }}></span>
              <span style={{ color: '#94a3b8' }}><strong style={{ color: '#eab308' }}>Sarı:</strong> Etkili oynuyor, gol bulabilir</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#64748b', borderRadius: '50%' }}></span>
              <span style={{ color: '#94a3b8' }}><strong style={{ color: '#64748b' }}>Gri:</strong> Etkisiz oyun oynuyor</span>
            </div>
          </div>

          {/* Loading / Error states */}
          {loading && matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #f97316', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
              <p>Canlı karşılaşmalar ve anlık istatistikler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="status-message error" style={{ padding: '16px', borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              Şu anda aramanıza uygun canlı karşılaşma bulunmamaktadır.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {Object.entries(byLeague).map(([leagueName, leagueMatches]) => (
                <div key={leagueName} className="league-card" style={{ backgroundColor: '#0d1527', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div className="league-header" style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🏆</span>
                    <h3 className="league-title" style={{ margin: 0, fontSize: 14, fontWeight: 'bold', color: '#e2e8f0' }}>{leagueName}</h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="matches-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px', width: 80 }}>DK / DURUM</th>
                          <th style={{ padding: '12px 16px', minWidth: 260 }}>KARŞILAŞMA</th>
                          <th style={{ padding: '12px 16px', width: 90, textAlign: 'center' }}>👟 ŞUT</th>
                          <th style={{ padding: '12px 16px', width: 80, textAlign: 'center' }}>⛳ KORNER</th>
                          <th style={{ padding: '12px 16px', width: 90, textAlign: 'center' }}>📈 T.OYNAMA</th>
                          <th style={{ padding: '12px 16px', width: 100, textAlign: 'center' }}>🟨 / 🟥 KART</th>
                          <th style={{ padding: '12px 16px', minWidth: 200, textAlign: 'center' }}>📊 GOL BASINCI / TEMPO</th>
                          <th style={{ padding: '12px 16px', width: 90, textAlign: 'center' }}>ANALİZ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leagueMatches.map(m => {
                          const hasOdds = m.pre_match_odds["1"] && m.pre_match_odds["X"] && m.pre_match_odds["2"];
                          
                          // Status dot color helper
                          const getStatusDotColor = (colorName: string) => {
                            switch (colorName) {
                              case 'green': return '#22c55e';
                              case 'blue': return '#3b82f6';
                              case 'yellow': return '#eab308';
                              default: return '#64748b';
                            }
                          };

                          // Determine pressure colors
                          const getPressureColor = (val: number) => {
                            if (val >= 70) return '#ef4444'; // Red
                            if (val >= 50) return '#eab308'; // Yellow
                            return '#22c55e'; // Green
                          };

                          return (
                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#f1f5f9' }}>
                              {/* Minute */}
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: '#22c55e', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                                  <span className="font-mono text-orange-500 font-bold" style={{ fontSize: 13 }}>
                                    {m.status === 'halftime' || m.status_description?.toLowerCase() === 'halftime' ? 'İY' : `${m.minute}'`}
                                  </span>
                                </div>
                              </td>

                              {/* Teams & Score */}
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: getStatusDotColor(m.status_color?.home), borderRadius: '50%' }}></span>
                                      <span style={{ fontWeight: 600, fontSize: 14 }}>{m.homeTeam}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: getStatusDotColor(m.status_color?.away), borderRadius: '50%' }}></span>
                                      <span style={{ fontWeight: 600, fontSize: 14 }}>{m.awayTeam}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 60 }}>
                                    <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                      <span className="font-mono font-bold text-orange-500" style={{ fontSize: 15 }}>
                                        {m.score_h} - {m.score_a}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>
                                      İY: {m.score_ht_h} - {m.score_ht_a}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Shots */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                  <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                                    {`${m.stats.shots_total_h ?? 0} > ${m.stats.shots_target_h ?? 0}`}
                                  </span>
                                  <span style={{ fontSize: 13, color: '#64748b' }}>
                                    {`${m.stats.shots_total_a ?? 0} > ${m.stats.shots_target_a ?? 0}`}
                                  </span>
                                </div>
                              </td>

                              {/* Corners */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                  <span style={{ fontSize: 13, fontWeight: 'bold', color: '#38bdf8' }}>{m.stats.corners_h ?? 0}</span>
                                  <span style={{ fontSize: 13, color: '#64748b' }}>{m.stats.corners_a ?? 0}</span>
                                </div>
                              </td>

                              {/* Possession */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                  <span style={{ fontSize: 13, fontWeight: 'bold', color: '#f59e0b' }}>%{m.stats.possession_h ?? 50}</span>
                                  <span style={{ fontSize: 13, color: '#64748b' }}>%{m.stats.possession_a ?? 50}</span>
                                </div>
                              </td>

                              {/* Cards */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                  {/* Home cards */}
                                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#eab308', borderRadius: 2 }} title="Sarı Kart"></span>
                                    <span style={{ fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>{m.stats.yellow_h}</span>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#ef4444', borderRadius: 2 }} title="Kırmızı Kart"></span>
                                    <span style={{ fontSize: 11, fontWeight: 'bold' }}>{m.stats.red_h}</span>
                                  </div>
                                  {/* Away cards */}
                                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#eab308', borderRadius: 2, opacity: 0.5 }} title="Sarı Kart"></span>
                                    <span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>{m.stats.yellow_a}</span>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#ef4444', borderRadius: 2, opacity: 0.5 }} title="Kırmızı Kart"></span>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>{m.stats.red_a}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Pressure & Tempo */}
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {/* Pressure side-by-side bar */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 'bold' }}>
                                      <span style={{ color: getPressureColor(m.pressure.home) }}>%{m.pressure.home} Ev</span>
                                      <span style={{ color: getPressureColor(m.pressure.away) }}>%{m.pressure.away} Dep</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', overflow: 'hidden' }}>
                                      <div style={{ width: `${m.pressure.home}%`, backgroundColor: getPressureColor(m.pressure.home) }}></div>
                                      <div style={{ width: `${m.pressure.away}%`, backgroundColor: getPressureColor(m.pressure.away), opacity: 0.8 }}></div>
                                    </div>
                                  </div>

                                  {/* Absolute tempo rating */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: 12 }}>{m.pressure.tempo >= 60 ? '🔥' : '📈'}</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                      Tempo / Baskı Puanı: <strong style={{ color: m.pressure.tempo >= 60 ? '#f97316' : '#e2e8f0' }}>{m.pressure.tempo}</strong>
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Actions (AI Button) */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                {hasOdds ? (
                                  <Link
                                    href={`/?homeTeam=${encodeURIComponent(m.homeTeam)}&awayTeam=${encodeURIComponent(m.awayTeam)}&league=${encodeURIComponent(m.league)}&oddsHome=${m.pre_match_odds["1"]}&oddsDraw=${m.pre_match_odds["X"]}&oddsAway=${m.pre_match_odds["2"]}&displayMode=DASHBOARD`}
                                    className="analyze-btn"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      backgroundColor: '#6366f1',
                                      color: '#ffffff',
                                      padding: '8px 16px',
                                      borderRadius: 8,
                                      border: 'none',
                                      fontWeight: 'bold',
                                      fontSize: 13,
                                      cursor: 'pointer',
                                      textDecoration: 'none',
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    <span>AI</span>
                                  </Link>
                                ) : (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      backgroundColor: 'rgba(255,255,255,0.03)',
                                      color: '#475569',
                                      padding: '8px 16px',
                                      borderRadius: 8,
                                      fontWeight: 'bold',
                                      fontSize: 13,
                                      cursor: 'not-allowed',
                                    }}
                                    title="Ön maç oranları bulunamadığı için AI Analizi yapılamaz."
                                  >
                                    Yok
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* CSS Spinner / Global Animations Keyframes (injected fallback) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
        .analyze-btn:hover {
          background-color: #4f46e5 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}
