import React, { useState } from 'react';
import type { SimilarMatch } from '../lib/analysis';

interface DashboardViewProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  similarMatches: SimilarMatch[];
}

// Takım ismi için şık bir gradyan avatar oluşturan yardımcı
function TeamAvatar({ name }: { name: string }) {
  const cleanName = name.trim().toUpperCase();
  const initial = cleanName.charAt(0) || '?';
  
  // İsmin harflerine göre tutarlı bir renk çifti üret
  const charCode = cleanName.charCodeAt(0) || 0;
  const gradients = [
    ['#1e3c72', '#2a5298'], // Mavi
    ['#11998e', '#38ef7d'], // Yeşil
    ['#ff9966', '#ff5e62'], // Turuncu/Kırmızı
    ['#7F00FF', '#E100FF'], // Mor
    ['#f12711', '#f5af19'], // Sarı/Kırmızı
    ['#00c6ff', '#0072ff'], // Açık Mavi
    ['#3a7bd5', '#3a6073'], // Gri Mavi
    ['#d3cbb8', '#6d6027'], // Altın/Toprak
  ];
  const grad = gradients[charCode % gradients.length];
  
  return (
    <div style={{
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      fontWeight: 700,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {initial}
    </div>
  );
}

export function DashboardView({ date, time, league, homeTeam, awayTeam, similarMatches }: DashboardViewProps) {
  const refs = similarMatches.filter(m => !m.isTargetMatch);
  const total = refs.length;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'HEPSİ' | 'AYNI_MAC' | 'AYNI_LIG'>('HEPSİ');
  const [visibleCount, setVisibleCount] = useState(4);

  // ── İstatistiklerin Hesaplanması ───────────────────────────────────────────

  const getHtFtResult = (ht: string, ft: string): string => {
    const parse = (s: string) => {
      const parts = s.split(':').map(Number);
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
      return { h: parts[0], a: parts[1] };
    };
    const htScore = parse(ht);
    const ftScore = parse(ft);
    if (!htScore || !ftScore) return '';
    const htRes = htScore.h > htScore.a ? '1' : (htScore.h < htScore.a ? '2' : '0');
    const ftRes = ftScore.h > ftScore.a ? '1' : (ftScore.h < ftScore.a ? '2' : '0');
    return `${htRes}/${ftRes}`;
  };

  const getGoalCount = (score: string): number | null => {
    const parts = score.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return parts[0] + parts[1];
  };

  const msSkorFreq: Record<string, number> = {};
  const iyMsFreq: Record<string, number> = {};
  const iySkorFreq: Record<string, number> = {};
  const iyGolFreq: Record<string, number> = {};
  const msGolFreq: Record<string, number> = {};

  refs.forEach(m => {
    // 1. MS Skor (format: 2-1)
    if (m.ftScore && m.ftScore.includes(':')) {
      const formatted = m.ftScore.replace(':', '-');
      msSkorFreq[formatted] = (msSkorFreq[formatted] || 0) + 1;
    }
    // 2. IY/MS (format: 1/1)
    if (m.htScore && m.ftScore) {
      const result = getHtFtResult(m.htScore, m.ftScore);
      if (result) {
        iyMsFreq[result] = (iyMsFreq[result] || 0) + 1;
      }
    }
    // 3. IY Skor (format: 1-0)
    if (m.htScore && m.htScore.includes(':')) {
      const formatted = m.htScore.replace(':', '-');
      iySkorFreq[formatted] = (iySkorFreq[formatted] || 0) + 1;
    }
    // 4. IY Gol
    if (m.htScore) {
      const count = getGoalCount(m.htScore);
      if (count !== null) {
        const key = `${count} Gol`;
        iyGolFreq[key] = (iyGolFreq[key] || 0) + 1;
      }
    }
    // 5. MS Gol
    if (m.ftScore) {
      const count = getGoalCount(m.ftScore);
      if (count !== null) {
        const key = `${count} Gol`;
        msGolFreq[key] = (msGolFreq[key] || 0) + 1;
      }
    }
  });

  const getSortedStats = (freq: Record<string, number>) => {
    return Object.entries(freq)
      .map(([value, count]) => ({
        value,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const msSkorStats = getSortedStats(msSkorFreq);
  const iyMsStats = getSortedStats(iyMsFreq);
  const iySkorStats = getSortedStats(iySkorFreq);
  const iyGolStats = getSortedStats(iyGolFreq);
  const msGolStats = getSortedStats(msGolFreq);

  // ── Benzer Maçlar Filtreleme ve Arama ───────────────────────────────────────

  const filteredMatches = refs.filter(m => {
    // Metin araması (Takım isimleri veya lig)
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      m.homeTeam.toLowerCase().includes(q) || 
      m.awayTeam.toLowerCase().includes(q) ||
      (m.league && m.league.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Filtre butonları
    if (filterType === 'AYNI_MAC') {
      const isExactMatch = 
        (m.homeTeam.toLowerCase() === homeTeam.toLowerCase() && m.awayTeam.toLowerCase() === awayTeam.toLowerCase()) ||
        (m.homeTeam.toLowerCase() === awayTeam.toLowerCase() && m.awayTeam.toLowerCase() === homeTeam.toLowerCase());
      return isExactMatch;
    }
    if (filterType === 'AYNI_LIG') {
      return m.league && m.league.toLowerCase() === league.toLowerCase();
    }

    return true;
  });

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  return (
    <div className="analysis-card" style={{ padding: '25px', background: '#090d14', color: '#c8d8e8' }}>
      
      {/* ── Üst Başlık ve Bilgiler ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <div style={{ color: '#8ab', fontSize: '0.85rem', fontWeight: 600 }}>Maç sayısı: {total}</div>
          <div style={{ color: '#8ab', fontSize: '0.85rem', marginTop: '2px' }}>{date}{time ? `, ${time}` : ''}</div>
          <h2 style={{ color: '#aec6e8', fontSize: '1.7rem', fontWeight: 700, marginTop: '5px' }}>{homeTeam} - {awayTeam}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TeamAvatar name={homeTeam} />
          <TeamAvatar name={awayTeam} />
        </div>
      </div>

      {/* ── Tab Butonları Görünümü (Tasarım Amaçlı) ─────────────────────────── */}
      <div style={{
        display: 'flex',
        background: '#0d1320',
        borderRadius: '6px',
        padding: '2px',
        border: '1px solid #141f32',
        marginBottom: '25px',
        justifyContent: 'space-between'
      }}>
        {['Skorlar', 'IY/MS', 'İlk yarı Skor', 'İlk Yarı Gol', 'Maç Sonu Gol'].map((tab, idx) => (
          <div key={idx} style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: idx === 0 ? '#fff' : '#8ab',
            borderRight: idx < 4 ? '1px solid #141f32' : 'none',
            background: idx === 0 ? '#131e30' : 'none',
            borderRadius: '4px',
            cursor: 'default'
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* ── İstatistik Kart Sütunları ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '40px' }}>
        
        {/* Sütun 1: MS Skor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {msSkorStats.map((stat, i) => {
            const isGreen = stat.pct >= 50 || (i === 0 && stat.pct >= 35);
            const borderCol = isGreen ? '#28c828' : '#e6c62a';
            return (
              <div key={i} style={{ background: '#0e1522', border: `2px solid ${borderCol}`, borderRadius: '8px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <div style={{ color: borderCol, fontSize: '1.2rem', fontWeight: 800 }}>%{stat.pct}</div>
                <div style={{ color: '#8ab', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>MS Skor</div>
                <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '6px 0' }}>{stat.value}</div>
                <div style={{ color: '#546b82', fontSize: '0.7rem' }}>{stat.count} Kere</div>
              </div>
            );
          })}
        </div>

        {/* Sütun 2: IY/MS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {iyMsStats.map((stat, i) => {
            const isGreen = stat.pct >= 50 || (i === 0 && stat.pct >= 35);
            const borderCol = isGreen ? '#28c828' : '#e6c62a';
            return (
              <div key={i} style={{ background: '#0e1522', border: `2px solid ${borderCol}`, borderRadius: '8px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <div style={{ color: borderCol, fontSize: '1.2rem', fontWeight: 800 }}>%{stat.pct}</div>
                <div style={{ color: '#8ab', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>IY / MS</div>
                <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '6px 0' }}>{stat.value}</div>
                <div style={{ color: '#546b82', fontSize: '0.7rem' }}>{stat.count} Kere</div>
              </div>
            );
          })}
        </div>

        {/* Sütun 3: İlk Yarı Skor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {iySkorStats.map((stat, i) => {
            const isGreen = stat.pct >= 50 || (i === 0 && stat.pct >= 35);
            const borderCol = isGreen ? '#28c828' : '#e6c62a';
            return (
              <div key={i} style={{ background: '#0e1522', border: `2px solid ${borderCol}`, borderRadius: '8px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <div style={{ color: borderCol, fontSize: '1.2rem', fontWeight: 800 }}>%{stat.pct}</div>
                <div style={{ color: '#8ab', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>IY Skor</div>
                <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '6px 0' }}>{stat.value}</div>
                <div style={{ color: '#546b82', fontSize: '0.7rem' }}>{stat.count} Kere</div>
              </div>
            );
          })}
        </div>

        {/* Sütun 4: İlk Yarı Gol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {iyGolStats.map((stat, i) => {
            const isGreen = stat.pct >= 50 || (i === 0 && stat.pct >= 35);
            const borderCol = isGreen ? '#28c828' : '#e6c62a';
            return (
              <div key={i} style={{ background: '#0e1522', border: `2px solid ${borderCol}`, borderRadius: '8px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <div style={{ color: borderCol, fontSize: '1.2rem', fontWeight: 800 }}>%{stat.pct}</div>
                <div style={{ color: '#8ab', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>IY Gol</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>{stat.value}</div>
                <div style={{ color: '#546b82', fontSize: '0.7rem' }}>{stat.count} Kere</div>
              </div>
            );
          })}
        </div>

        {/* Sütun 5: Maç Sonu Gol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {msGolStats.map((stat, i) => {
            const isGreen = stat.pct >= 50 || (i === 0 && stat.pct >= 35);
            const borderCol = isGreen ? '#28c828' : '#e6c62a';
            return (
              <div key={i} style={{ background: '#0e1522', border: `2px solid ${borderCol}`, borderRadius: '8px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <div style={{ color: borderCol, fontSize: '1.2rem', fontWeight: 800 }}>%{stat.pct}</div>
                <div style={{ color: '#8ab', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>Toplam Gol</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>{stat.value}</div>
                <div style={{ color: '#546b82', fontSize: '0.7rem' }}>{stat.count} Kere</div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Benzer Maçlar Başlığı ve Arama Paneli ────────────────────────────── */}
      <div style={{ borderTop: '1px solid #141f32', paddingTop: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ color: '#aec6e8', fontSize: '1.25rem', fontWeight: 700 }}>Benzer Maçlar</h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Metin Arama Kutusu */}
            <input 
              type="text" 
              placeholder="HEPSİ" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#0d1320',
                border: '1px solid #1c2a42',
                color: '#fff',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                outline: 'none',
                width: '180px'
              }}
            />
            {filteredMatches.length > visibleCount && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 4)}
                className="nav-btn"
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1c2a42' }}
              >
                Daha fazla yükle
              </button>
            )}
          </div>
        </div>

        {/* Filtreleme Badgeleri */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => { setFilterType('HEPSİ'); setVisibleCount(4); }}
            style={{
              background: filterType === 'HEPSİ' ? '#0d1320' : 'none',
              border: `1px solid ${filterType === 'HEPSİ' ? '#385885' : '#141f32'}`,
              color: filterType === 'HEPSİ' ? '#fff' : '#8ab',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            HEPSİ
          </button>
          
          <button 
            onClick={() => { setFilterType('AYNI_MAC'); setVisibleCount(4); }}
            style={{
              background: filterType === 'AYNI_MAC' ? '#0d1320' : 'none',
              border: `1px solid ${filterType === 'AYNI_MAC' ? '#28c828' : '#141f32'}`,
              color: filterType === 'AYNI_MAC' ? '#fff' : '#8ab',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c828' }}></span>
            Aynı Maç
          </button>

          <button 
            onClick={() => { setFilterType('AYNI_LIG'); setVisibleCount(4); }}
            style={{
              background: filterType === 'AYNI_LIG' ? '#0d1320' : 'none',
              border: `1px solid ${filterType === 'AYNI_LIG' ? '#e87070' : '#141f32'}`,
              color: filterType === 'AYNI_LIG' ? '#fff' : '#8ab',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e87070' }}></span>
            Aynı Lig
          </button>
        </div>

        {/* Maç Kartları Listesi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {visibleMatches.map(m => {
            const hRes = getHtFtResult(m.htScore, m.ftScore);
            return (
              <div key={m.id} style={{
                background: '#0d1320',
                border: '1px solid #141f32',
                borderRadius: '8px',
                padding: '12px 15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#546b82', fontSize: '0.65rem', fontWeight: 600 }}>{m.matchDate || '01.01.2024'}</div>
                  <div style={{ color: '#aec6e8', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                    {m.homeTeam} - {m.awayTeam}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
                    {m.ftScore.replace(':', ' - ')}
                    {hRes && <span style={{ color: '#5dc85d', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>(IY/MS {hRes})</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <TeamAvatar name={m.homeTeam} />
                  <TeamAvatar name={m.awayTeam} />
                </div>
              </div>
            );
          })}
          {visibleMatches.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#546b82', fontSize: '0.85rem' }}>
              Arama kriterlerine uygun benzer maç bulunamadı.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
