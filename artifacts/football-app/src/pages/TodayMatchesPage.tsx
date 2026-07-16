import React, { useState, useEffect } from 'react';
import { useGetTodayMatches, useRefreshTodayMatches } from '@workspace/api-client-react';
import { Link } from 'wouter';

interface TodayMatch {
  id: number;
  tarih: string;
  saat: string;
  lig: string;
  ev_sahibi: string;
  deplasman: string;
  oran_1: number | null;
  oran_x: number | null;
  oran_2: number | null;
  alt_orani: number | null;
  ust_orani: number | null;
  kg_var: number | null;
  kg_yok: number | null;
  durum: string;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}

function OddsCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-gray-600">—</span>;
  return <span className="font-bold text-green-400">{value.toFixed(2)}</span>;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function spawnScraper(): Promise<{ ok: boolean; message: string }> {
  const r = await fetch(`${BASE}/api/admin/scraper/spawn`, { method: 'POST' });
  return r.json();
}

export default function TodayMatchesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [spawning, setSpawning] = useState(false);

  const { data, isLoading, refetch } = useGetTodayMatches({ date: selectedDate });
  const refreshMutation = useRefreshTodayMatches();

  const handleRefresh = async () => {
    setMsg(null);
    refreshMutation.mutate(undefined, {
      onSuccess: (result: any) => {
        const isErr = !result.ok || (result.message ?? '').toLowerCase().includes('hata') || (result.message ?? '').toLowerCase().includes('bağlantı');
        setMsgType(isErr ? 'err' : 'ok');
        setMsg(result.message ?? 'Güncellendi');
        if (!isErr) refetch();
      },
      onError: (err: any) => {
        setMsgType('err');
        setMsg(err?.message ?? 'Bilinmeyen hata');
      },
    });
  };

  const handleSpawn = async () => {
    setSpawning(true);
    setMsg(null);
    try {
      const result = await spawnScraper();
      setMsgType(result.ok ? 'ok' : 'err');
      setMsg(result.message);
      if (result.ok) {
        // Kısa bekleyip veri güncelle
        setTimeout(() => handleRefresh(), 1500);
      }
    } catch (e: any) {
      setMsgType('err');
      setMsg(`Başlatma hatası: ${e?.message ?? 'Bilinmeyen hata'}`);
    } finally {
      setSpawning(false);
    }
  };

  // Scraper bağlantı hatası mı?
  const isScraperOffline = msg != null && msgType === 'err' && (
    msg.toLowerCase().includes('bağlantı') ||
    msg.toLowerCase().includes('scraper') ||
    msg.toLowerCase().includes('çalışmıyor') ||
    msg.toLowerCase().includes('fetch failed')
  );

  const matches: TodayMatch[] = data?.matches ?? [];
  const filtered = matches.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.ev_sahibi.toLowerCase().includes(q) ||
      m.deplasman.toLowerCase().includes(q) ||
      m.lig.toLowerCase().includes(q)
    );
  });

  // Group by league
  const byLeague: Record<string, TodayMatch[]> = {};
  for (const m of filtered) {
    const key = m.lig || 'Diğer';
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
        <nav className="app-nav">
          <Link href="/" className="nav-btn" style={{ textDecoration: 'none' }}>← Analiz</Link>
          <Link href="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>⚙️ Veri Havuzu</Link>
          <span className="nav-tag">Günlük Maçlar</span>
        </nav>
      </header>

      <main className="app-main">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Hero */}
          <div className="form-hero">
            <h1 className="form-hero-title">Günlük Maç Programı</h1>
            <p className="form-hero-sub">
              Takım adı veya lig arayın — oranları direkt forma aktarın
            </p>
          </div>

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
                disabled={refreshMutation.isPending}
                style={{ padding: '6px 18px', borderColor: '#28a628', color: '#28c828' }}
              >
                {refreshMutation.isPending ? '⏳ Güncelleniyor...' : '🔄 Veri Güncelle'}
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
                    background: spawning ? '#1a2a1a' : 'linear-gradient(135deg,#1a5a1a,#228822)',
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
            Maç bilgileri ve oranlar otomatik olarak forma aktarılır. Her sabah <strong>08:00</strong>'de
            tüm liglerin günlük maç programı ve oranları güncellenir.
          </div>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8ab' }}>
              ⏳ Maçlar yükleniyor...
            </div>
          )}

          {!isLoading && data && (
            <div style={{ marginBottom: 12, color: '#8ab', fontSize: '0.82rem' }}>
              <strong style={{ color: '#aec6e8' }}>{formatDate(selectedDate)}</strong>
              &nbsp;— Toplam <strong style={{ color: '#28c828' }}>{data.total}</strong> maç
              {data.last_updated && (
                <span> · Son güncelleme: {new Date(data.last_updated).toLocaleString('tr-TR')}</span>
              )}
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
              <div style={{ fontSize: '0.82rem' }}>
                Veri getirmek için <strong style={{ color: '#28c828' }}>🔄 Veri Güncelle</strong> butonuna tıklayın
                <br />veya Admin panelinden scraper'ı çalıştırın.
              </div>
            </div>
          )}

          {/* Matches by league */}
          {Object.entries(byLeague).map(([league, leagueMatches]) => (
            <div key={league} style={{ marginBottom: 24 }}>
              <div style={{
                background: '#131820', borderLeft: '3px solid #28a628',
                padding: '8px 14px', marginBottom: 6,
                fontSize: '0.85rem', fontWeight: 700, color: '#aec6e8',
                letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8
              }}>
                🏆 {league}
                <span style={{ fontSize: '0.72rem', color: '#556', fontWeight: 400 }}>
                  ({leagueMatches.length} maç)
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.81rem' }}>
                  <thead>
                    <tr style={{ background: '#0d1320', color: '#7a9cb0' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.04em' }}>SAAT</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.04em' }}>EV SAHİBİ</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.04em' }}>DEPLASMAN</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#5dc85d' }}>1</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#e6c62a' }}>X</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#e87070' }}>2</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#5dc85d' }}>Alt</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#e87070' }}>Üst</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#5dc85d' }}>KG Var</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: '#e87070' }}>KG Yok</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueMatches.map((m, i) => (
                      <tr key={m.id} style={{ background: i % 2 === 0 ? '#0e1520' : '#0c1218', borderBottom: '1px solid #141e28' }}>
                        <td style={{ padding: '8px 10px', color: '#5dc85d', fontWeight: 700 }}>{m.saat || '—'}</td>
                        <td style={{ padding: '8px 10px', color: '#c8d8e8', fontWeight: 600 }}>{m.ev_sahibi}</td>
                        <td style={{ padding: '8px 10px', color: '#c8d8e8', fontWeight: 600 }}>{m.deplasman}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}><OddsCell value={m.oran_1} /></td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.oran_x != null ? <span style={{ color: '#e6c62a', fontWeight: 700 }}>{m.oran_x.toFixed(2)}</span> : <span className="text-gray-600">—</span>}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.oran_2 != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.oran_2.toFixed(2)}</span> : <span className="text-gray-600">—</span>}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}><OddsCell value={m.alt_orani} /></td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.ust_orani != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.ust_orani.toFixed(2)}</span> : <span style={{ color: '#334' }}>—</span>}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}><OddsCell value={m.kg_var} /></td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.kg_yok != null ? <span style={{ color: '#e87070', fontWeight: 700 }}>{m.kg_yok.toFixed(2)}</span> : <span style={{ color: '#334' }}>—</span>}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <AnalyzeButton match={m} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function AnalyzeButton({ match }: { match: TodayMatch }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '.');
  const timeStr = match.saat || '';

  // Build URL params to pre-populate the analysis form
  const params = new URLSearchParams({
    homeTeam: match.ev_sahibi,
    awayTeam: match.deplasman,
    league: match.lig,
    date: dateStr,
    time: timeStr,
    ...(match.oran_1 != null ? { oddsHome: match.oran_1.toString() } : {}),
    ...(match.oran_x != null ? { oddsDraw: match.oran_x.toString() } : {}),
    ...(match.oran_2 != null ? { oddsAway: match.oran_2.toString() } : {}),
    ...(match.alt_orani != null ? { altOdds: match.alt_orani.toString() } : {}),
    ...(match.ust_orani != null ? { ustOdds: match.ust_orani.toString() } : {}),
    ...(match.kg_var != null ? { varOdds: match.kg_var.toString() } : {}),
    ...(match.kg_yok != null ? { yokOdds: match.kg_yok.toString() } : {}),
  });

  return (
    <Link
      href={`/?${params.toString()}`}
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #1a5a1a, #228822)',
        border: '1px solid #28a828',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: 4,
        fontSize: '0.72rem',
        fontWeight: 700,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '0.03em',
      }}
    >
      → Analiz Et
    </Link>
  );
}
