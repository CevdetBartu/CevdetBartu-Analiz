import React, { useState, useEffect, useCallback } from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const API = `${BASE}/api/admin/scraper`;

interface DbStats {
  total_mac: number;
  oranli_mac: number;
  en_eski: string | null;
  en_yeni: string | null;
  ligler: { lig: string; mac: number }[];
}

interface WorkerInfo {
  status: string;
  is_running: boolean;
  current_date: string | null;
  total_added: number;
  total_skipped: number;
  last_error: string | null;
  elapsed_sec: number | null;
}

interface StatsResponse {
  db: DbStats;
  worker: WorkerInfo;
}

export default function AdminPage() {
  const [stats, setStats]       = useState<StatsResponse | null>(null);
  const [offline, setOffline]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<string | null>(null);
  const [seasonsBack, setSeasons] = useState(4);
  const [spawning, setSpawning] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/stats`);
      if (!r.ok) {
        setOffline(true);
        return;
      }
      const data = await r.json();
      setStats(data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  // İlk yükleme + scraper çalışıyorsa her 4sn yenile
  useEffect(() => {
    fetchStats();
    const id = setInterval(() => fetchStats(), 4000);
    return () => clearInterval(id);
  }, [fetchStats]);

  async function handleSpawn() {
    setSpawning(true);
    setMsg(null);
    try {
      const r = await fetch(`${BASE}/api/admin/scraper/spawn`, { method: 'POST' });
      const data = await r.json();
      setMsg(data.message);
      if (data.ok) setTimeout(() => fetchStats(), 1500);
    } catch (e: any) {
      setMsg(`Başlatma hatası: ${e.message}`);
    } finally {
      setSpawning(false);
    }
  }

  async function doAction(endpoint: string, method = 'POST', body?: object) {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch(`${API}/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await r.json();
      setMsg(data.message || JSON.stringify(data));
      fetchStats();
    } catch (e: any) {
      setMsg(`Hata: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const isRunning = stats?.worker?.is_running ?? false;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">⚙️ Veri Havuzu Yönetimi</h1>
        <p className="admin-sub">SofaScore'dan geçmiş maç verisi çekme ve SQLite veritabanı yönetimi</p>
      </div>

      {offline && (
        <div className="admin-alert-offline" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <strong>⚠️ Scraper servisi çevrimdışı.</strong><br />
            <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              Aşağıdaki butona tıklayın ya da terminalde{' '}
              <code>python3 scripts/scraper/run.py</code> çalıştırın.
            </span>
          </div>
          <button
            onClick={handleSpawn}
            disabled={spawning}
            style={{
              background: spawning ? '#1a2a1a' : 'linear-gradient(135deg,#1a5a1a,#228822)',
              border: '2px solid #28a828',
              color: '#fff',
              padding: '8px 22px',
              borderRadius: 5,
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: spawning ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
            }}
          >
            {spawning ? '⏳ Başlatılıyor…' : '▶ Scraper\'ı Başlat'}
          </button>
        </div>
      )}

      {msg && (
        <div className="admin-msg">{msg}</div>
      )}

      {/* ── Kontrol Paneli ─────────────────────────────────────────── */}
      <div className="admin-card">
        <h2 className="admin-card-title">Scraper Kontrolü</h2>

        <div className="admin-worker-status">
          <span className={`status-dot ${isRunning ? 'dot-green' : 'dot-gray'}`}></span>
          <span className="status-label">
            {stats?.worker.status ?? (offline ? 'bilinmiyor' : 'kontrol ediliyor…')}
          </span>
          {stats?.worker.elapsed_sec != null && (
            <span className="status-elapsed">
              {Math.floor(stats.worker.elapsed_sec / 60)}d {Math.floor(stats.worker.elapsed_sec % 60)}s
            </span>
          )}
        </div>

        {stats?.worker.current_date && (
          <div className="admin-current-date">
            📅 İşlenen tarih: <strong>{stats.worker.current_date}</strong>
          </div>
        )}
        {stats?.worker.last_error && (
          <div className="admin-error-text">❌ {stats.worker.last_error}</div>
        )}

        <div className="admin-control-row">
          <div className="admin-months-ctrl">
            <label className="admin-label">Geriye dönük sezon sayısı:</label>
            <select
              className="admin-select"
              value={seasonsBack}
              onChange={e => setSeasons(Number(e.target.value))}
              disabled={isRunning}
            >
              {[1, 2, 3, 4, 5, 6, 8].map(m => (
                <option key={m} value={m}>{m} sezon</option>
              ))}
            </select>
          </div>

          <div className="admin-btn-row">
            {!isRunning ? (
              <button
                className="admin-btn admin-btn-start"
                onClick={() => doAction('start', 'POST', { seasons_back: seasonsBack })}
                disabled={loading || offline}
              >
                ▶ Taramayı Başlat
              </button>
            ) : (
              <button
                className="admin-btn admin-btn-stop"
                onClick={() => doAction('stop')}
                disabled={loading}
              >
                ⏹ Durdur
              </button>
            )}
            <button
              className="admin-btn admin-btn-reset"
              onClick={() => {
                if (confirm('Son işlenen tarihi sıfırla ve baştan tara?')) doAction('reset');
              }}
              disabled={loading || isRunning || offline}
              title="Baştan taramak için tarihi sıfırlar"
            >
              ↺ Sıfırla
            </button>
            <button
              className="admin-btn admin-btn-refresh"
              onClick={fetchStats}
              disabled={loading}
            >
              ⟳ Yenile
            </button>
          </div>
        </div>
      </div>

      {/* ── Veritabanı İstatistikleri ──────────────────────────────── */}
      {stats?.db && (
        <div className="admin-card">
          <h2 className="admin-card-title">Veritabanı İstatistikleri</h2>

          <div className="admin-stats-grid">
            <div className="admin-stat-box">
              <div className="stat-num">{stats.db.total_mac.toLocaleString('tr-TR')}</div>
              <div className="stat-lbl">Toplam Maç</div>
            </div>
            <div className="admin-stat-box">
              <div className="stat-num">{stats.db.oranli_mac.toLocaleString('tr-TR')}</div>
              <div className="stat-lbl">Oranlı Maç</div>
            </div>
            <div className="admin-stat-box">
              <div className="stat-num">{stats.worker.total_added}</div>
              <div className="stat-lbl">Bu Oturumda Eklenen</div>
            </div>
            <div className="admin-stat-box">
              <div className="stat-num">{stats.worker.total_skipped}</div>
              <div className="stat-lbl">Atlanan</div>
            </div>
          </div>

          <div className="admin-date-range">
            <span>📅 Veri aralığı: </span>
            <strong>{stats.db.en_eski ?? '—'}</strong>
            <span> → </span>
            <strong>{stats.db.en_yeni ?? '—'}</strong>
          </div>

          {/* ── Ligler tablosu ── */}
          {stats.db.ligler.length > 0 && (
            <div className="admin-leagues-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lig</th>
                    <th>Maç Sayısı</th>
                    <th>Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.db.ligler.map((l, i) => {
                    const pct = stats.db.total_mac > 0
                      ? Math.round((l.mac / stats.db.total_mac) * 100)
                      : 0;
                    return (
                      <tr key={l.lig}>
                        <td className="td-num">{i + 1}</td>
                        <td className="td-lig-name">{l.lig}</td>
                        <td className="td-mac">{l.mac.toLocaleString('tr-TR')}</td>
                        <td className="td-pct">
                          <div className="pct-bar-wrap">
                            <div className="pct-bar" style={{ width: `${pct}%` }}></div>
                            <span className="pct-label">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Kullanım Kılavuzu ─────────────────────────────────────── */}
      <div className="admin-card admin-card-info">
        <h2 className="admin-card-title">Nasıl Çalışır?</h2>
        <ol className="admin-steps">
          <li>Terminalde <code>python3 scripts/scraper/run.py</code> komutunu çalıştırın.</li>
          <li>Bu sayfada "<strong>Taramayı Başlat</strong>" butonuna tıklayın.</li>
          <li>Scraper SofaScore'dan seçili liglerin geçmiş maçlarını otomatik çeker.</li>
          <li>Çekilen veriler <code>scripts/scraper/gecmis_maclar.db</code> dosyasına kaydedilir.</li>
          <li>Ana sayfadaki "<strong>Benzer Maçları Bul</strong>" özelliği bu veri havuzunu kullanır.</li>
        </ol>
        <div className="admin-leagues-info">
          <strong>Takip edilen ligler:</strong> Türkiye Süper Lig, 1. Lig, UEFA Şampiyonlar/Avrupa/Konferans Ligi,
          Premier Lig, La Liga, Bundesliga, Serie A, Ligue 1, Eredivisie, Primeira Liga ve daha fazlası.
        </div>
      </div>
    </div>
  );
}
