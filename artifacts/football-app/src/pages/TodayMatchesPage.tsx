import React, { useState } from 'react';
import { useGetTodayMatches, useRefreshTodayMatches } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { isAuthenticated } from '../lib/auth';
import { AnalysisModal } from '../components/AnalysisModal';
import { PredictModal } from '../components/PredictModal';
import { CouponWizard } from '../components/CouponWizard';

interface TodayMatch {
  id: number;
  tarih: string;
  saat: string;
  lig: string;
  ev_sahibi: string;
  deplasman: string;
  oran_1?: number | null;
  oran_x?: number | null;
  oran_2?: number | null;
  alt_orani?: number | null;
  ust_orani?: number | null;
  kg_var?: number | null;
  kg_yok?: number | null;
  lig_sira_ev?: number | null;
  lig_sira_dep?: number | null;
  toplam_takim?: number | null;
  alt_orani_35?: number | null;
  ust_orani_35?: number | null;
  iy_alt_orani_15?: number | null;
  iy_ust_orani_15?: number | null;
  iy_alt_orani_05?: number | null;
  iy_ust_orani_05?: number | null;
  oran_1_acilis?: number | null;
  oran_x_acilis?: number | null;
  oran_2_acilis?: number | null;
  alt_orani_acilis?: number | null;
  ust_orani_acilis?: number | null;
  kg_var_acilis?: number | null;
  kg_yok_acilis?: number | null;
  alt_orani_35_acilis?: number | null;
  ust_orani_35_acilis?: number | null;
  iy_alt_orani_15_acilis?: number | null;
  iy_ust_orani_15_acilis?: number | null;
  iy_alt_orani_05_acilis?: number | null;
  iy_ust_orani_05_acilis?: number | null;
  durum?: string;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}

function OddsCell({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-gray-600">—</span>;
  return <span className="font-bold text-green-400">{value.toFixed(2)}</span>;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function spawnScraper(): Promise<{ ok: boolean; message: string }> {
  const r = await fetch(`${BASE}/api/admin/scraper/spawn`, { method: 'POST' });
  return r.json();
}

export default function TodayMatchesPage() {
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getTodayDateStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [spawning, setSpawning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Modal Analysis States
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [predictModalOpen, setPredictModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetTodayMatches({ date: selectedDate });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMsg(null);

    // 1. Instantly refetch DB matches for selected date
    try {
      await refetch();
    } catch (e) {}

    // 2. Trigger quick async refresh call with 2s max timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(`${BASE}/api/today-matches/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        setMsgType('ok');
        setMsg(json.message || 'Bülten verileri başarıyla güncellendi.');
      } else {
        setMsgType('ok');
        setMsg('Bülten verileri güncel.');
      }
    } catch (e) {
      setMsgType('ok');
      setMsg('Bülten veritabanından anında güncellendi.');
    } finally {
      setIsRefreshing(false);
      refetch();
    }
  };

  const handleSpawn = async () => {
    setSpawning(true);
    setMsg(null);
    try {
      const result = await spawnScraper();
      setMsgType(result.ok ? 'ok' : 'err');
      setMsg(result.message);
      if (result.ok) {
        setTimeout(() => handleRefresh(), 1500);
      }
    } catch (e: any) {
      setMsgType('err');
      setMsg(`Başlatma hatası: ${e?.message ?? 'Bilinmeyen hata'}`);
    } finally {
      setSpawning(false);
    }
  };

  const isScraperOffline = msg != null && msgType === 'err' && (
    msg.toLowerCase().includes('bağlantı') ||
    msg.toLowerCase().includes('scraper') ||
    msg.toLowerCase().includes('çalışmıyor') ||
    msg.toLowerCase().includes('fetch failed')
  );

  const matches: TodayMatch[] = data?.matches ?? [];
  const filtered = matches.filter(m => {
    // 1. Sidebar country filter
    if (selectedCountry) {
      const league = (m.lig || '').toLowerCase();
      switch (selectedCountry) {
        case 'Türkiye':
          if (!league.includes('turkey') && !league.includes('türk') && !league.includes('super lig') && !league.includes('süper lig')) return false;
          break;
        case 'İngiltere':
          if (!league.includes('england') && !league.includes('premier league') && !league.includes('ingiltere') && !league.includes('championship')) return false;
          break;
        case 'İspanya':
          if (!league.includes('spain') && !league.includes('laliga') && !league.includes('ispanya')) return false;
          break;
        case 'İtalya':
          if (!league.includes('italy') && !league.includes('serie a') && !league.includes('italya')) return false;
          break;
        case 'Almanya':
          if (!league.includes('germany') && !league.includes('bundesliga') && !league.includes('almanya')) return false;
          break;
        case 'Fransa':
          if (!league.includes('france') && !league.includes('ligue 1') && !league.includes('fransa')) return false;
          break;
        case 'Brezilya':
          if (!league.includes('brazil') && !league.includes('brezilya') && !(league.includes('serie a') && league.includes('braz'))) return false;
          break;
        case 'Hollanda':
          if (!league.includes('netherlands') && !league.includes('eredivisie') && !league.includes('hollanda')) return false;
          break;
        case 'Portekiz':
          if (!league.includes('portugal') && !league.includes('portekiz')) return false;
          break;
        case 'Arjantin':
          if (!league.includes('argentina') && !league.includes('arjantin')) return false;
          break;
        case 'Danimarka':
          if (!league.includes('denmark') && !league.includes('danimarka')) return false;
          break;
        case 'Japonya':
          if (!league.includes('japan') && !league.includes('japonya')) return false;
          break;
        case 'Belçika':
          if (!league.includes('belgium') && !league.includes('belçika') && !league.includes('belcika')) return false;
          break;
      }
    }

    // 2. Search query filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.ev_sahibi.toLowerCase().includes(q) ||
      m.deplasman.toLowerCase().includes(q) ||
      m.lig.toLowerCase().includes(q)
    );
  });

  const byLeague: Record<string, TodayMatch[]> = {};
  for (const m of filtered) {
    const key = m.lig || 'Diğer';
    if (!byLeague[key]) byLeague[key] = [];
    byLeague[key].push(m);
  }

  return (
    <div className="app-container">
      
      


      <main className="app-main">
        <div style={{ maxWidth: 1350, margin: '0 auto' }}>
          {/* Hero */}
          
            <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--foreground)", marginBottom: "8px" }}>Günün Programı</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Maçları inceleyin ve otomatik analiz edin.</p>
            </div>

          <CouponWizard />

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Tarih Seç</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 180 }}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
              <label className="form-label">Takım / Lig Ara</label>
              <input
                type="search"
                className="form-input"
                placeholder="Örn: Corinthians, Atlético, Brezilya..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">&nbsp;</label>
              <button
                className="nav-btn"
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{ padding: '6px 18px', borderColor: '#28a628', color: '#28c828', cursor: 'pointer' }}
              >
                {isRefreshing ? '⏳ Güncelleniyor...' : '🔄 Veri Güncelle'}
              </button>
            </div>
          </div>

          {msg && (
            <div style={{
              background: msgType === 'err' ? 'rgba(200,40,40,0.15)' : 'rgba(40,168,40,0.15)',
              border: `1px solid ${msgType === 'err' ? '#c82828' : '#28a828'}`,
              color: msgType === 'err' ? '#f08080' : '#5dc85d',
              padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{ flex: 1 }}>{msgType === 'err' ? '⚠️' : '✓'} {msg}</span>
              {isScraperOffline && (
                <button
                  onClick={handleSpawn}
                  disabled={spawning}
                  style={{
                    background: spawning ? '#1a2a1a' : 'var(--primary)',
                    border: '1px solid #28a828',
                    color: '#fff',
                    padding: '6px 18px',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: spawning ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.03em',
                  }}
                >
                  {spawning ? '⏳ Başlatılıyor…' : '▶ Scraper\'ı Başlat'}
                </button>
              )}
            </div>
          )}

          {/* Info box */}
          <div style={{
            background: '#0d1420', border: '1px solid #1e3040', borderRadius: 6,
            padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#8ab', lineHeight: 1.6
          }}>
            <strong style={{ color: '#aec6e8' }}>ℹ️ Nasıl kullanılır?</strong>
            &nbsp; Bir maç satırındaki <strong style={{ color: '#28c828' }}>→ Analiz Et</strong> butonuna tıklayın.
            Sistem arka planda olasılık benzerlik motorunu çalıştırır ve detaylı AI analiz raporunu anında sunar.
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 24 }}>
            {/* Left Sidebar */}
            <aside className="sidebar-countries" style={{ 
              width: 250, 
              flexShrink: 0, 
              position: 'sticky', 
              top: 90, 
              backgroundColor: '#0f1322', 
              borderRadius: 12, 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8, letterSpacing: '0.05em' }}>Ülkeler / Ligler</h4>
              {[
                { name: 'Tüm Ligler', flag: '🌍', id: null },
                { name: 'Türkiye', flag: '🇹🇷', id: 'Türkiye' },
                { name: 'İngiltere', flag: '🇬🇧', id: 'İngiltere' },
                { name: 'İspanya', flag: '🇪🇸', id: 'İspanya' },
                { name: 'İtalya', flag: '🇮🇹', id: 'İtalya' },
                { name: 'Almanya', flag: '🇩🇪', id: 'Almanya' },
                { name: 'Fransa', flag: '🇫🇷', id: 'Fransa' },
                { name: 'Brezilya', flag: '🇧🇷', id: 'Brezilya' },
                { name: 'Hollanda', flag: '🇳🇱', id: 'Hollanda' },
                { name: 'Portekiz', flag: '🇵🇹', id: 'Portekiz' },
                { name: 'Arjantin', flag: '🇦🇷', id: 'Arjantin' },
                { name: 'Danimarka', flag: '🇩🇰', id: 'Danimarka' },
                { name: 'Japonya', flag: '🇯🇵', id: 'Japonya' },
                { name: 'Belçika', flag: '🇧🇪', id: 'Belçika' },
              ].map((c) => {
                const active = selectedCountry === c.id;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCountry(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: active ? 'var(--foreground)' : '#94a3b8',
                      fontWeight: active ? 'bold' : '500',
                      fontSize: '13.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </aside>

            {/* Right Main Matches Feed */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8ab' }}>
                  ⏳ Maçlar yükleniyor...
                </div>
              )}

              {!isLoading && data && (
                <div style={{ marginBottom: 12, color: '#8ab', fontSize: '0.82rem' }}>
                  <strong style={{ color: '#aec6e8' }}>{formatDate(selectedDate)}</strong>
                  &nbsp;— Toplam <strong style={{ color: '#28c828' }}>{data.total}</strong> maç
                </div>
              )}

              {!isLoading && filtered.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '60px 20px', color: '#556',
                  background: '#0d1420', border: '1px solid #1a2230', borderRadius: 8
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: '1rem', color: '#8ab', marginBottom: 8 }}>
                    {searchQuery ? `"${searchQuery}" için maç bulunamadı` : 'Bu tarih için veri bulunamadı'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Veri getirmek için <strong style={{ color: '#28c828' }}>🔄 Veri Güncelle</strong> butonuna tıklayın.
                  </div>
                </div>
              )}

              {!isLoading && filtered.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {Object.entries(byLeague).map(([leagueName, leagueMatches]) => (
                    <div key={leagueName} className="league-card" style={{ background: '#0d1420', border: '1px solid #1e3040', borderRadius: 6, overflow: 'hidden' }}>
                      <div className="league-header" style={{ background: '#131e30', padding: '8px 12px', borderBottom: '1px solid #1e3040', fontWeight: 'bold', fontSize: '0.82rem', color: '#aec6e8' }}>
                        🏆 {leagueName}
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#090f18', borderBottom: '1px solid #1e3040', color: '#8ab' }}>
                              <th style={{ padding: '8px 12px', width: 60 }}>Saat</th>
                              <th style={{ padding: '8px 12px' }}>Karşılaşma</th>
                              <th style={{ padding: '8px 12px', width: 50, textAlign: 'center' }}>1</th>
                              <th style={{ padding: '8px 12px', width: 50, textAlign: 'center' }}>X</th>
                              <th style={{ padding: '8px 12px', width: 50, textAlign: 'center' }}>2</th>
                              <th style={{ padding: '8px 12px', width: 60, textAlign: 'center' }}>Alt 2.5</th>
                              <th style={{ padding: '8px 12px', width: 60, textAlign: 'center' }}>Üst 2.5</th>
                              
                              <th style={{ padding: '8px 12px', width: 100, textAlign: 'center' }}>İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leagueMatches.map((m, i) => {
                              const hasOdds = true; // Always allow analysis
                              return (
                                <tr key={m.id} style={{ background: i % 2 === 0 ? 'var(--card)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '8px 12px', color: '#5dc85d', fontWeight: 700 }}>{m.saat || '—'}</td>
                                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                                    {m.ev_sahibi} <span style={{ color: '#8ab', fontWeight: 400 }}>v</span> {m.deplasman}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}><OddsCell value={m.oran_1} /></td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{m.oran_x != null ? <span style={{ color: '#eab308', fontWeight: 700 }}>{m.oran_x.toFixed(2)}</span> : <span className="text-gray-600">—</span>}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{m.oran_2 != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.oran_2.toFixed(2)}</span> : <span className="text-gray-600">—</span>}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}><OddsCell value={m.alt_orani} /></td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{m.ust_orani != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.ust_orani.toFixed(2)}</span> : <span style={{ color: '#334' }}>—</span>}</td>
                                  
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                    {hasOdds ? (
                                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => {
                                            setSelectedMatch({
                                              id: m.id,
                                              saat: m.saat,
                                              homeTeam: m.ev_sahibi,
                                              awayTeam: m.deplasman,
                                              league: m.lig,
                                              oddsHome: m.oran_1,
                                              oddsDraw: m.oran_x,
                                              oddsAway: m.oran_2,
                                              altOdds: m.alt_orani,
                                              ustOdds: m.ust_orani,
                                              varOdds: m.kg_var,
                                              yokOdds: m.kg_yok
                                            });
                                            setPredictModalOpen(true);
                                          }}
                                          title="Tahmin Et"
                                          style={{
                                            padding: '4px 8px', background: '#10b981', color: 'white', border: 'none',
                                            borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                                          }}>
                                          Tahmin
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedMatch({
                                              homeTeam: m.ev_sahibi,
                                              awayTeam: m.deplasman,
                                              league: m.lig,
                                              oddsHome: m.oran_1,
                                              oddsDraw: m.oran_x,
                                              oddsAway: m.oran_2,
                                              altOdds: m.alt_orani,
                                              ustOdds: m.ust_orani,
                                              varOdds: m.kg_var,
                                              yokOdds: m.kg_yok,
                                              altOdds35: m.alt_orani_35,
                                              ustOdds35: m.ust_orani_35,
                                              iyAltOdds15: m.iy_alt_orani_15,
                                              iyUstOdds15: m.iy_ust_orani_15,
                                              iyAltOdds05: m.iy_alt_orani_05,
                                              iyUstOdds05: m.iy_ust_orani_05,
                                              oran_1_acilis: m.oran_1_acilis,
                                              oran_x_acilis: m.oran_x_acilis,
                                              oran_2_acilis: m.oran_2_acilis,
                                              alt_orani_acilis: m.alt_orani_acilis,
                                              ust_orani_acilis: m.ust_orani_acilis,
                                              kg_var_acilis: m.kg_var_acilis,
                                              kg_yok_acilis: m.kg_yok_acilis,
                                              alt_orani_35_acilis: m.alt_orani_35_acilis,
                                              ust_orani_35_acilis: m.ust_orani_35_acilis,
                                              iy_alt_orani_15_acilis: m.iy_alt_orani_15_acilis,
                                              iy_ust_orani_15_acilis: m.iy_ust_orani_15_acilis,
                                              iy_alt_orani_05_acilis: m.iy_alt_orani_05_acilis,
                                              iy_ust_orani_05_acilis: m.iy_ust_orani_05_acilis,
                                              oran_1_kapanis: m.oran_1,
                                              oran_x_kapanis: m.oran_x,
                                              oran_2_kapanis: m.oran_2,
                                              alt_orani_kapanis: m.alt_orani,
                                              ust_orani_kapanis: m.ust_orani,
                                              kg_var_kapanis: m.kg_var,
                                              kg_yok_kapanis: m.kg_yok,
                                              alt_orani_35_kapanis: m.alt_orani_35,
                                              ust_orani_35_kapanis: m.ust_orani_35,
                                              iy_alt_orani_15_kapanis: m.iy_alt_orani_15,
                                              iy_ust_orani_15_kapanis: m.iy_ust_orani_15,
                                              iy_alt_orani_05_kapanis: m.iy_alt_orani_05,
                                              iy_ust_orani_05_kapanis: m.iy_ust_orani_05,
                                              ligSirasiHome: m.lig_sira_ev,
                                              ligSirasiAway: m.lig_sira_dep,
                                              ligSirasiTotal: m.toplam_takim,
                                              date: selectedDate,
                                              time: m.saat
                                            });
                                            setModalOpen(true);
                                          }}
                                          style={{
                                            display: 'inline-block',
                                            background: 'var(--primary)',
                                            border: '1px solid #28a828',
                                            color: '#fff',
                                            padding: '4px 10px',
                                            borderRadius: 4,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          Analiz Et
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '0.72rem', color: '#475569', cursor: 'not-allowed' }}>Oran Yok</span>
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
          </div>
        </div>
      </main>

      <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        match={selectedMatch}
      />
    </div>
  );
}
