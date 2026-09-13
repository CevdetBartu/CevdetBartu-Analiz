import React, { useState } from 'react';
import type { SimilarMatch } from '../lib/analysis';

interface DashboardViewProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  similarMatches: SimilarMatch[];
  targetMatch?: any;
  analyzeResponse?: any;
}

function normTr(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIıi]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")
    .toLowerCase()
    .trim();
}

function getLeagueTokens(str?: string | null): string[] {
  if (!str) return [];
  const clean = str
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIıi]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")
    .toLowerCase()
    .replace(/\b(qualification|qualifications|eleme|elemeler|playoff|playoffs|group|stage|knockout|round|phase)\b/gi, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  return clean.split(/\s+/).filter(w => w.length > 2 && w !== "league" && w !== "lig" && w !== "liga");
}

function getTeamTokens(str?: string | null): string[] {
  if (!str) return [];
  const clean = str
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIıi]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")
    .toLowerCase()
    .replace(/\b(fc|cf|fk|united|city|ac|real|club|sc|rc|u23|u20|w|women)\b/gi, " ")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  return clean.split(/\s+/).filter(w => w.length > 2);
}

export function DashboardView({ date, time, league, homeTeam, awayTeam, similarMatches, targetMatch }: DashboardViewProps) {
  const refs = similarMatches.filter(m => !m.isTargetMatch);

  const [selectedYear, setSelectedYear] = useState<string>('0');
  const [filterType, setFilterType] = useState<number>(0); // 0: HEPSİ, 1: Aynı Maç, 2: Aynı Lig, 3: Oran Benzeri
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isNewVersion, setIsNewVersion] = useState<boolean>(true);

  const getHtFtResult = (ht: string, ft: string): string => {
    const parse = (s: string) => {
      const parts = s.split(':').map(Number);
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
      return { h: parts[0], a: parts[1] };
    };
    const htScore = parse(ht);
    const ftScore = parse(ft);
    if (!htScore || !ftScore) return '';
    const htRes = htScore.h > htScore.a ? '1' : (htScore.h < htScore.a ? '2' : 'X');
    const ftRes = ftScore.h > ftScore.a ? '1' : (ftScore.h < ftScore.a ? '2' : 'X');
    return `${htRes}/${ftRes}`;
  };

  const getGoalCount = (score: string): number | null => {
    const parts = score.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return parts[0] + parts[1];
  };

  // Robust H2H matching using team tokens
  const isMatchSameH2H = (m: SimilarMatch) => {
    const h1 = getTeamTokens(m.homeTeam);
    const a1 = getTeamTokens(m.awayTeam);
    const h2 = getTeamTokens(homeTeam);
    const a2 = getTeamTokens(awayTeam);
    if (h1.length === 0 || a1.length === 0 || h2.length === 0 || a2.length === 0) return false;

    const h1_h2 = h1.some(t => h2.includes(t));
    const a1_a2 = a1.some(t => a2.includes(t));
    const h1_a2 = h1.some(t => a2.includes(t));
    const a1_h2 = a1.some(t => h2.includes(t));

    const matchForward = h1_h2 && a1_a2;
    const matchReverse = h1_a2 && a1_h2;
    return matchForward || matchReverse;
  };

  // Robust League matching using league tokens
  const isMatchSameLeague = (m: SimilarMatch) => {
    if (!m.league || !league) return false;
    const t1 = getLeagueTokens(m.league);
    const t2 = getLeagueTokens(league);
    if (t1.length === 0 || t2.length === 0) return false;

    const matches = t1.filter(token => t2.includes(token));
    return matches.length >= 1;
  };

  // Enforce >= 95% similarity score rule for Oran Benzerliği category
  const isMatchOddsSimilar = (m: SimilarMatch) => {
    const sim = parseFloat((m.similarityScore || '0').toString().replace(',', '.'));
    if (sim >= 95) return true;

    const parseOdds = (val?: string | number | null) => {
      if (val == null) return null;
      const s = val.toString().replace(',', '.');
      const n = parseFloat(s);
      return isNaN(n) ? null : n;
    };

    const t1 = parseOdds(targetMatch?.oddsHome || targetMatch?.oran_1_acilis || targetMatch?.oran_1_kapanis);
    const tx = parseOdds(targetMatch?.oddsDraw || targetMatch?.oran_x_acilis || targetMatch?.oran_x_kapanis);
    const t2 = parseOdds(targetMatch?.oddsAway || targetMatch?.oran_2_acilis || targetMatch?.oran_2_kapanis);

    const m1 = parseOdds(m.oddsHome);
    const mx = parseOdds(m.oddsDraw);
    const m2 = parseOdds(m.oddsAway);

    if (t1 != null && tx != null && t2 != null && m1 != null && mx != null && m2 != null) {
      const diff = Math.abs(t1 - m1) + Math.abs(tx - mx) + Math.abs(t2 - m2);
      if (diff <= 0.15) return true; // Exact odds match within 0.15 total delta (>=95% equivalent)
    }

    return false;
  };

  // Compute counts for tab badges
  const countAll = refs.length;
  const countH2H = refs.filter(isMatchSameH2H).length;
  const countLeague = refs.filter(isMatchSameLeague).length;
  const countOdds = refs.filter(isMatchOddsSimilar).length;

  // 1. KargaTahmin Analiz Maç Filtreleme Sistemi
  const filteredMatches = refs.filter(m => {
    // Sezon Yılı Filtresi
    if (selectedYear !== '0') {
      const matchDateStr = m.matchDate || (m as any).date || (m as any).tarih || '';
      if (matchDateStr && !matchDateStr.includes(selectedYear)) return false;
    }

    if (filterType === 1) return isMatchSameH2H(m);
    if (filterType === 2) return isMatchSameLeague(m);
    if (filterType === 3) return isMatchOddsSimilar(m);

    return true;
  });

  const effectiveTotal = filteredMatches.length;

  // 2. KargaTahmin Analiz Gelişmiş Matematiksel Motor (Mesafe Ağırlıklı + Zaman Sönümlemeli + Bayesyen Yumuşatma)
  const msSkorFreq: Record<string, { count: number; weight: number }> = {};
  const iyMsFreq: Record<string, { count: number; weight: number }> = {};
  const iySkorFreq: Record<string, { count: number; weight: number }> = {};
  const iyGolFreq: Record<string, { count: number; weight: number }> = {};
  const msGolFreq: Record<string, { count: number; weight: number }> = {};

  let totalMatchWeight = 0;

  filteredMatches.forEach(m => {
    // Ağırlık 1: Oran Benzerlik Mesafesi (Distance Weight)
    const simScore = parseFloat((m.similarityScore || '80').toString().replace(',', '.'));
    const distWeight = Math.max(0.1, simScore / 100);

    // Ağırlık 2: Zaman Sönümlemesi (Exponential Time-Decay Weight)
    let timeWeight = 1.0;
    const matchYearStr = m.matchDate || (m as any).date || (m as any).tarih || '';
    if (matchYearStr.includes('2026')) timeWeight = 1.0;
    else if (matchYearStr.includes('2025')) timeWeight = 0.85;
    else if (matchYearStr.includes('2024')) timeWeight = 0.70;
    else if (matchYearStr.includes('2023')) timeWeight = 0.50;
    else if (matchYearStr.includes('2022')) timeWeight = 0.35;
    else timeWeight = 0.20;

    const combinedWeight = distWeight * timeWeight;
    totalMatchWeight += combinedWeight;

    const addFreq = (dict: Record<string, { count: number; weight: number }>, key: string) => {
      if (!dict[key]) dict[key] = { count: 0, weight: 0 };
      dict[key].count += 1;
      dict[key].weight += combinedWeight;
    };

    if (m.ftScore && m.ftScore.includes(':')) {
      const formatted = m.ftScore.replace(':', '-');
      addFreq(msSkorFreq, formatted);
    }

    if (m.htScore && m.htScore.includes(':')) {
      const formatted = m.htScore.replace(':', '-');
      addFreq(iySkorFreq, formatted);
    }

    if (m.htScore) {
      const count = getGoalCount(m.htScore);
      if (count !== null) {
        addFreq(iyGolFreq, `${count} Gol`);
      }
    }

    if (m.ftScore) {
      const count = getGoalCount(m.ftScore);
      if (count !== null) {
        addFreq(msGolFreq, `${count} Gol`);
      }
    }

    if (m.htScore && m.ftScore) {
      const result = getHtFtResult(m.htScore, m.ftScore);
      if (result) {
        addFreq(iyMsFreq, result);
      }
    }
  });

  // 3. Bayesyen Yumuşatmalı Yüzde Formülü (Bayesian Shrinkage Smoothing)
  const getCRSAnalizPct = (weightedVal: number, totalWeight: number, count: number, tot: number) => {
    if (tot <= 0 || totalWeight <= 0) return 0;
    // Direct weighted ratio
    const rawPct = (weightedVal / totalWeight) * 100;
    // Bayesian shrinkage prior smoothing for small N
    const alpha = 8.0;
    const prior = 100.0 / Math.max(1, tot);
    const bayesPct = (weightedVal + alpha * (prior / 100)) / (totalWeight + alpha) * 100;
    return Math.round(tot < 10 ? bayesPct : rawPct);
  };

  const getSortedStats = (freq: Record<string, { count: number; weight: number }>) => {
    return Object.entries(freq)
      .map(([value, data]) => ({
        value,
        count: data.count,
        pct: getCRSAnalizPct(data.weight, totalMatchWeight, data.count, effectiveTotal)
      }))
      .sort((a, b) => b.pct - a.pct || b.count - a.count);
  };

  const msSkorStats = getSortedStats(msSkorFreq);
  const iyMsStats = getSortedStats(iyMsFreq);
  const iySkorStats = getSortedStats(iySkorFreq);
  const iyGolStats = getSortedStats(iyGolFreq);
  const msGolStats = getSortedStats(msGolFreq);

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  return (
    <div style={{ background: '#090d16', color: '#ffffff', minHeight: '100vh', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Navigation Bar (KargaTahmin Analiz Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.5px' }}>
          🏆 {league.toUpperCase()} KargaTahmin ANALİZ RAPORU
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            📋 Tablo Görünümü
          </button>
        </div>
      </div>

      {/* Sub-header Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Maç sayısı: <strong style={{ color: '#38bdf8', fontSize: '14px' }}>{effectiveTotal}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sezon Seçimi Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setVisibleCount(6); }}
            style={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 'bold',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="0">HEPSİ</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>

          {/* Versiyon Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIsNewVersion(!isNewVersion)}>
            <div style={{
              width: '42px',
              height: '22px',
              backgroundColor: isNewVersion ? '#6366f1' : '#475569',
              borderRadius: '11px',
              position: 'relative',
              transition: 'background 0.2s'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isNewVersion ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
              Yeni Versiyon
            </span>
          </div>
        </div>
      </div>

      {/* Title Match Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
          {homeTeam} - {awayTeam}
        </h1>
        <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '6px', fontWeight: '600' }}>
          🏆 {league}
        </div>
      </div>

      {/* 5-Column Categorical Matrix (KargaTahmin Analiz Screenshot Exact Replica) */}
      <div style={{ marginBottom: '36px' }}>
        {/* Table Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2px',
          backgroundColor: '#111827',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '14px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>Skorlar</div>
          <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>IY/MS</div>
          <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>İlk yarı Skor</div>
          <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>İlk Yarı Gol</div>
          <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>Maç Sonu Gol</div>
        </div>

        {/* 5 Vertical Card Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          
          {/* Column 1: Skorlar (Cyan %18) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {msSkorStats.length > 0 ? msSkorStats.slice(0, 5).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#0d1322', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', color: '#38bdf8', fontWeight: '900' }}>%{s.pct}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>MS Skor</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.count} Kere</div>
              </div>
            )) : <div style={{ padding: '16px', color: '#475569', fontSize: '12px', textAlign: 'center' }}>-</div>}
          </div>

          {/* Column 2: IY/MS (Green %24) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {iyMsStats.length > 0 ? iyMsStats.slice(0, 5).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#0d1322', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', color: '#4ade80', fontWeight: '900' }}>%{s.pct}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IY / MS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.count} Kere</div>
              </div>
            )) : <div style={{ padding: '16px', color: '#475569', fontSize: '12px', textAlign: 'center' }}>-</div>}
          </div>

          {/* Column 3: İlk Yarı Skor (Gold %38) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {iySkorStats.length > 0 ? iySkorStats.slice(0, 5).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#0d1322', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', color: '#facc15', fontWeight: '900' }}>%{s.pct}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IY Skor</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.count} Kere</div>
              </div>
            )) : <div style={{ padding: '16px', color: '#475569', fontSize: '12px', textAlign: 'center' }}>-</div>}
          </div>

          {/* Column 4: İlk Yarı Gol (Purple %38) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {iyGolStats.length > 0 ? iyGolStats.slice(0, 5).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#0d1322', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', color: '#c084fc', fontWeight: '900' }}>%{s.pct}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IY Gol</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.count} Kere</div>
              </div>
            )) : <div style={{ padding: '16px', color: '#475569', fontSize: '12px', textAlign: 'center' }}>-</div>}
          </div>

          {/* Column 5: Maç Sonu Gol (Pink %31) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {msGolStats.length > 0 ? msGolStats.slice(0, 5).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#0d1322', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', color: '#f472b6', fontWeight: '900' }}>%{s.pct}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Toplam Gol</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.count} Kere</div>
              </div>
            )) : <div style={{ padding: '16px', color: '#475569', fontSize: '12px', textAlign: 'center' }}>-</div>}
          </div>
        </div>
      </div>

      {/* Benzer Maçlar Listesi */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Benzer Maçlar</strong>
          {filteredMatches.length > visibleCount && (
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Daha fazla yükle (+{filteredMatches.length - visibleCount})
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { label: `HEPSİ (${countAll})`, type: 0 },
            { label: `🟢 Aynı Maç (${countH2H})`, type: 1 },
            { label: `🔴 Aynı Lig (${countLeague})`, type: 2 },
            { label: `⭐ Oran Benzerliği (${countOdds})`, type: 3 },
          ].map(tab => (
            <button
              key={tab.type}
              onClick={() => { setFilterType(tab.type); setVisibleCount(6); }}
              style={{
                backgroundColor: filterType === tab.type ? '#6366f1' : 'transparent',
                color: filterType === tab.type ? '#ffffff' : '#94a3b8',
                border: filterType === tab.type ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleMatches.length > 0 ? (
            visibleMatches.map((m, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0d1322',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {m.matchDate || (m as any).date || 'Tarih Belirsiz'} · 🏆 {m.league || 'Lig Belirsiz'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                    {m.homeTeam} <span style={{ color: '#38bdf8' }}>{m.ftScore ? `[ ${m.ftScore} ]` : ''}</span> {m.awayTeam}
                  </div>
                  {m.htScore && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      İlk Yarı: {m.htScore}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Oranlar</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>
                    {m.oddsHome} - {m.oddsDraw} - {m.oddsAway}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              Seçilen filtreye uygun maç bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
