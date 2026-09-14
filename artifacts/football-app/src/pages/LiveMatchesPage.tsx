import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AnalysisModal } from '../components/AnalysisModal';
import { fetchWithAuth } from '../lib/auth';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('karga_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const favoritesRef = React.useRef(favorites);
  const prevScoresRef = React.useRef<Record<number, {h: number, a: number}>>({});

  useEffect(() => {
    favoritesRef.current = favorites;
    localStorage.setItem('karga_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const playGoalSound = () => {
    try {
      const audio = new Audio(`${BASE}/goal.mp3`);
      audio.play().catch(e => console.error("Ses çalma hatası:", e));
    } catch(e) {}
  };

  const fetchLiveMatches = async () => {
    try {
      const response = await fetchWithAuth(`${BASE}/api/live-matches`);
      if (!response.ok) {
        throw new Error('Canlı maç verileri çekilemedi.');
      }
      const data = await response.json();
      
      if (Object.keys(prevScoresRef.current).length > 0) {
        let goalDetected = false;
        for (const match of data) {
          if (favoritesRef.current.includes(match.id)) {
            const prev = prevScoresRef.current[match.id];
            if (prev) {
              if (match.score_h > prev.h || match.score_a > prev.a) {
                goalDetected = true;
              }
            }
          }
        }
        if (goalDetected) {
          playGoalSound();
        }
      }

      const newScores: Record<number, {h: number, a: number}> = {};
      data.forEach((m: any) => {
        newScores[m.id] = { h: m.score_h, a: m.score_a };
      });
      prevScoresRef.current = newScores;

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
    if (showOnlyFavorites && !favorites.includes(m.id)) return false;
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
      
      <header style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => (window.location.href = "/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "14px" }}>C</div>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)" }}>KargaTahmin <span style={{ fontWeight: "400", opacity: 0.7 }}>Analytics</span></span>
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


      <main className="app-main">
        <div style={{ maxWidth: 1350, margin: '0 auto' }}>
          {/* Hero */}
          
            <div style={{ padding: "30px 0 20px", textAlign: "center" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)", marginBottom: "8px" }}>Anlık Canlı Analiz</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Aktif karşılaşmaların hücum istatistiklerini (şut, korner, tempo) ve alarm durumlarını takip edin.</p>
            </div>


          {/* Search & Tabs */}
          <div style={{ marginBottom: 20, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Takım veya lig ara..."
              className="form-input"
              style={{ width: '100%', maxWidth: 400 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div style={{ display: 'flex', backgroundColor: 'var(--card)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowOnlyFavorites(false)}
                style={{
                  background: !showOnlyFavorites ? 'var(--primary)' : 'transparent',
                  color: !showOnlyFavorites ? '#fff' : 'var(--muted-foreground)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Tümü
              </button>
              <button
                onClick={() => setShowOnlyFavorites(true)}
                style={{
                  background: showOnlyFavorites ? 'var(--primary)' : 'transparent',
                  color: showOnlyFavorites ? '#fff' : 'var(--muted-foreground)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ color: showOnlyFavorites ? '#fbbf24' : '#64748b' }}>★</span> Favorilerim ({favorites.length})
              </button>
            </div>
            
            {/* Gol Sesi Test Butonu */}
            <button
              onClick={playGoalSound}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Gol sesini dinlemek için tıklayın"
            >
              🔊 Sesi Test Et
            </button>
          </div>

          {/* Color Status Legend */}
          <div style={{
            backgroundColor: '#0d1527',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
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
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#ca8a04', borderRadius: '50%' }}></span>
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
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', backgroundColor: 'transparent', borderRadius: 8, border: '1px solid var(--border)' }}>
              Şu anda aramanıza uygun canlı karşılaşma bulunmamaktadır.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {Object.entries(byLeague).map(([leagueName, leagueMatches]) => (
                <div key={leagueName} className="league-card" style={{ backgroundColor: '#0d1527', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div className="league-header" style={{ padding: '12px 16px', backgroundColor: 'transparent', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🏆</span>
                    <h3 className="league-title" style={{ margin: 0, fontSize: 14, fontWeight: 'bold', color: 'var(--foreground)' }}>{leagueName}</h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="matches-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px', width: 100 }}>DK / DURUM</th>
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
                          const hasOdds = true; // Always allow analysis
                          
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
                            <tr key={m.id} style={{ borderBottom: '1px solid transparent', color: '#f1f5f9' }}>
                              {/* Minute */}
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <button
                                    onClick={() => toggleFavorite(m.id)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: 18,
                                      color: favorites.includes(m.id) ? '#fbbf24' : '#475569',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: 2
                                    }}
                                    title={favorites.includes(m.id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                                  >
                                    {favorites.includes(m.id) ? '★' : '☆'}
                                  </button>
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
                                    {m.score_ht_h !== undefined && m.score_ht_h !== null ? (<span style={{ fontSize: 11, color: '#64748b' }}>İY: {m.score_ht_h} - {m.score_ht_a}</span>) : null}
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
                                  <span style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--foreground)' }}>{m.stats.corners_h ?? 0}</span>
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
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#ca8a04', borderRadius: 2 }} title="Sarı Kart"></span>
                                    <span style={{ fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>{m.stats.yellow_h}</span>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#b91c1c', borderRadius: 2 }} title="Kırmızı Kart"></span>
                                    <span style={{ fontSize: 11, fontWeight: 'bold' }}>{m.stats.red_h}</span>
                                  </div>
                                  {/* Away cards */}
                                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#ca8a04', borderRadius: 2, opacity: 0.5 }} title="Sarı Kart"></span>
                                    <span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>{m.stats.yellow_a}</span>
                                    <span style={{ display: 'inline-block', width: 10, height: 14, backgroundColor: '#b91c1c', borderRadius: 2, opacity: 0.5 }} title="Kırmızı Kart"></span>
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
                                    <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--border)', display: 'flex', overflow: 'hidden' }}>
                                      <div style={{ width: `${m.pressure.home}%`, backgroundColor: getPressureColor(m.pressure.home) }}></div>
                                      <div style={{ width: `${m.pressure.away}%`, backgroundColor: getPressureColor(m.pressure.away), opacity: 0.8 }}></div>
                                    </div>
                                  </div>

                                  {/* Absolute tempo rating */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'transparent', padding: '4px 10px', borderRadius: 6, border: 'none' }}>
                                    <span style={{ fontSize: 12 }}>{m.pressure.tempo >= 60 ? '🔥' : '📈'}</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                      Tempo / Baskı Puanı: <strong style={{ color: m.pressure.tempo >= 60 ? '#f97316' : 'var(--foreground)' }}>{m.pressure.tempo}</strong>
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Actions (AI Button) */}
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                {hasOdds ? (
                                  <button
                                      onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const b = m.bulletin_props || {};
                                          setSelectedMatch({
                                            homeTeam: m.homeTeam,
                                            awayTeam: m.awayTeam,
                                            league: b.lig || m.league,
                                            oddsHome: b.oran_1 || (m.pre_match_odds?.["1"] ? parseFloat(m.pre_match_odds["1"]) : null),
                                            oddsDraw: b.oran_x || (m.pre_match_odds?.["X"] ? parseFloat(m.pre_match_odds["X"]) : null),
                                            oddsAway: b.oran_2 || (m.pre_match_odds?.["2"] ? parseFloat(m.pre_match_odds["2"]) : null),
                                            altOdds: b.alt_orani,
                                            ustOdds: b.ust_orani,
                                            varOdds: b.kg_var,
                                            yokOdds: b.kg_yok,
                                            altOdds35: b.alt_orani_35,
                                            ustOdds35: b.ust_orani_35,
                                            iyAltOdds15: b.iy_alt_orani_15,
                                            iyUstOdds15: b.iy_ust_orani_15,
                                            iyAltOdds05: b.iy_alt_orani_05,
                                            iyUstOdds05: b.iy_ust_orani_05,
                                            oran_1_acilis: b.oran_1_acilis,
                                            oran_x_acilis: b.oran_x_acilis,
                                            oran_2_acilis: b.oran_2_acilis,
                                            alt_orani_acilis: b.alt_orani_acilis,
                                            ust_orani_acilis: b.ust_orani_acilis,
                                            kg_var_acilis: b.kg_var_acilis,
                                            kg_yok_acilis: b.kg_yok_acilis,
                                            alt_orani_35_acilis: b.alt_orani_35_acilis,
                                            ust_orani_35_acilis: b.ust_orani_35_acilis
                                          });
                                          setModalOpen(true);
                                        }}
                                      className="analyze-btn"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        backgroundColor: 'var(--primary)',
                                        color: '#ffffff',
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: 'none',
                                        fontWeight: 'bold',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                      }}
                                    >
                                      <span style={{fontWeight: 700}}>Analiz Et</span>
                                    </button>
                                ) : (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      backgroundColor: 'transparent',
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
          <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        match={selectedMatch}
      />
    </div>
  );
}
