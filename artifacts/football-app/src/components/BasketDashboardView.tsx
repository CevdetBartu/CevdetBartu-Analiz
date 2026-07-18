import React, { useState } from 'react';
import type { BasketSimilarMatch } from '../lib/basketAnalysis';

interface BasketDashboardViewProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  similarMatches: BasketSimilarMatch[];
}

export function BasketDashboardView({
  date,
  time,
  league,
  homeTeam,
  awayTeam,
  similarMatches,
}: BasketDashboardViewProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'SAME_MATCH' | 'SAME_LEAGUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const parsedMatches = similarMatches.filter(m => !m.isTargetMatch);

  // Filtreleme
  const filtered = parsedMatches.filter(m => {
    // Arama
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query) ||
      (m.league || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Sekme Filtreleri
    if (filterMode === 'SAME_MATCH') {
      return (
        m.homeTeam.toLowerCase() === homeTeam.toLowerCase() &&
        m.awayTeam.toLowerCase() === awayTeam.toLowerCase()
      );
    }
    if (filterMode === 'SAME_LEAGUE') {
      return (m.league || '').toLowerCase() === league.toLowerCase();
    }
    return true;
  });

  // İstatistikleri hesapla
  const completed = filtered.filter(m => m.ftScore && m.ftScore.includes(':'));
  const totalCount = completed.length;

  let homeWins = 0;
  let awayWins = 0;
  let overCount = 0;
  let underCount = 0;
  let totalPtsSum = 0;

  completed.forEach(m => {
    const [hStr, aStr] = m.ftScore.split(':');
    const h = parseInt(hStr, 10);
    const a = parseInt(aStr, 10);
    if (!isNaN(h) && !isNaN(a)) {
      if (h > a) homeWins++;
      else awayWins++;

      totalPtsSum += (h + a);

      // Toplam limit varsayımı (Target limit veya 160.5)
      const limit = parseFloat(m.toplam_limit.replace(',', '.')) || 160.5;
      if (h + a > limit) overCount++;
      else underCount++;
    }
  });

  const homeWinPct = totalCount > 0 ? Math.round((homeWins / totalCount) * 100) : 0;
  const awayWinPct = totalCount > 0 ? Math.round((awayWins / totalCount) * 100) : 0;
  const overPct = totalCount > 0 ? Math.round((overCount / totalCount) * 100) : 0;
  const underPct = totalCount > 0 ? Math.round((underCount / totalCount) * 100) : 0;
  const avgPts = totalCount > 0 ? (totalPtsSum / totalCount).toFixed(1) : '0';

  const getTeamInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getTeamGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      ['#f59e0b', '#d97706'], // Amber
      ['#3b82f6', '#2563eb'], // Blue
      ['#10b981', '#059669'], // Green
      ['#ef4444', '#dc2626'], // Red
      ['#8b5cf6', '#7c3aed'], // Purple
      ['#ec4899', '#db2777'], // Pink
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── İSTATİSTİK KARTLARI ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="dashboard-metric-card" style={{ background: '#111827', border: '1px solid #1f2937', padding: 20, borderRadius: 12 }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>🏀 Maç Sonucu Kazanma</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>%{homeWinPct}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ev Sahibi ({homeWins} Maç)</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>%{awayWinPct}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Deplasman ({awayWins} Maç)</div>
            </div>
          </div>
          <div style={{ height: 6, background: '#1f2937', borderRadius: 3, marginTop: 12, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${homeWinPct}%`, background: '#f59e0b', height: '100%' }}></div>
            <div style={{ width: `${awayWinPct}%`, background: '#3b82f6', height: '100%' }}></div>
          </div>
        </div>

        <div className="dashboard-metric-card" style={{ background: '#111827', border: '1px solid #1f2937', padding: 20, borderRadius: 12 }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>🔥 Toplam Limit Analizi</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>%{overPct}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Üst ({overCount} Maç)</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>%{underPct}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Alt ({underCount} Maç)</div>
            </div>
          </div>
          <div style={{ height: 6, background: '#1f2937', borderRadius: 3, marginTop: 12, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${overPct}%`, background: '#10b981', height: '100%' }}></div>
            <div style={{ width: `${underPct}%`, background: '#ef4444', height: '100%' }}></div>
          </div>
        </div>

        <div className="dashboard-metric-card" style={{ background: '#111827', border: '1px solid #1f2937', padding: 20, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', textAlign: 'center' }}>📊 Ortalama Toplam Sayı</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 8 }}>{avgPts}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>Benzer maçlarda üretilen ortalama sayı</span>
        </div>
      </div>

      {/* ── BENZER MAÇLAR FİLTRE VE ARAMA ───────────────────────────── */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', padding: 20, borderRadius: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`nav-btn ${filterMode === 'ALL' ? 'active' : ''}`} style={{ background: filterMode === 'ALL' ? '#f59e0b' : '#1f2937', color: filterMode === 'ALL' ? '#000' : '#fff' }} onClick={() => setFilterMode('ALL')}>HEPSİ</button>
            <button className={`nav-btn ${filterMode === 'SAME_MATCH' ? 'active' : ''}`} style={{ background: filterMode === 'SAME_MATCH' ? '#f59e0b' : '#1f2937', color: filterMode === 'SAME_MATCH' ? '#000' : '#fff' }} onClick={() => setFilterMode('SAME_MATCH')}>Aynı Maç</button>
            <button className={`nav-btn ${filterMode === 'SAME_LEAGUE' ? 'active' : ''}`} style={{ background: filterMode === 'SAME_LEAGUE' ? '#f59e0b' : '#1f2937', color: filterMode === 'SAME_LEAGUE' ? '#000' : '#fff' }} onClick={() => setFilterMode('SAME_LEAGUE')}>Aynı Lig</button>
          </div>
          <input type="text" className="form-input" style={{ width: 220 }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Maç veya lig ara..." />
        </div>

        {/* Maç Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.slice(0, visibleCount).map(m => {
            const gradHome = getTeamGradient(m.homeTeam);
            const gradAway = getTeamGradient(m.awayTeam);
            return (
              <div key={m.id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>{m.league}</span>
                  <span>{m.matchDate} {m.saat}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${gradHome[0]}, ${gradHome[1]})`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {getTeamInitials(m.homeTeam)}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{m.homeTeam}</span>
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{m.ftScore.split(':')[0]}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${gradAway[0]}, ${gradAway[1]})`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {getTeamInitials(m.awayTeam)}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{m.awayTeam}</span>
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{m.ftScore.split(':')[1]}</strong>
                </div>

                <div style={{ borderTop: '1px solid #374151', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>İY: {m.htScore || '-'}</span>
                  {m.score != null && <span style={{ color: '#f59e0b' }}>Uyuşum: %{m.score}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length > visibleCount && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <button className="nav-btn" style={{ background: '#1f2937' }} onClick={() => setVisibleCount(prev => prev + 8)}>Daha Fazla Yükle ({filtered.length - visibleCount})</button>
          </div>
        )}
      </div>
    </div>
  );
}
