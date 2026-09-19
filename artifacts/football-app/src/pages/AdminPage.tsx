import React, { useState, useEffect, useCallback } from 'react';
import { SeoHead } from '../components/seo/SeoHead';
import { Link, useLocation } from 'wouter';
import { fetchWithAuth, isAuthenticated, getUserRole } from '../lib/auth';
import AdminLayout from '../components/layout/AdminLayout';

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
  const [backupLoading, setBackupLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('15.08.2021');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetchWithAuth(`${API}/stats`);
      if (!r.ok) {
        setOffline(true);
        return;
      }
      const data = await r.json();
      setStats(data);
      if (isInitialLoad && data?.db?.en_eski) {
        setCustomStartDate(data.db.en_eski);
        setIsInitialLoad(false);
      }
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, [isInitialLoad]);

  const handleSaveStartDate = async () => {
    if (!customStartDate) return;
    try {
      const res = await fetchWithAuth(`${API}/set-start-date`, { method: "POST", body: JSON.stringify({ start_date: customStartDate }) });
      const data = await res.json();
      setMsg(data.message || "Başlangıç tarihi başarıyla güncellendi.");
    } catch (e: any) {
      setMsg(`Hata: ${e.message}`);
    }
  };

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
      const r = await fetchWithAuth(`${BASE}/api/admin/scraper/spawn`, { method: "POST" });
      const data = await r.json();
      setMsg(data.message);
      if (data.ok) setTimeout(() => fetchStats(), 1500);
    } catch (e: any) {
      setMsg(`Başlatma hatası: ${e.message}`);
    } finally {
      setSpawning(false);
    }
  }

  async function handleBackup() {
    setBackupLoading(true);
    setMsg(null);
    try {
      const r = await fetchWithAuth(`${BASE}/api/admin/db/backup`, { method: "POST" });
      const data = await r.json();
      setMsg(data.message);
    } catch (e: any) {
      setMsg(`Yedekleme hatası: ${e.message}`);
    } finally {
      setBackupLoading(false);
    }
  }

  async function doAction(endpoint: string, method = 'POST', body?: object) {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetchWithAuth(`${API}/${endpoint}`, {
        method,
        body: body ? JSON.stringify(body) : undefined
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
    <AdminLayout>
    <div className="admin-page" style={{ minHeight: "100vh" }}>
      {/* Header Bar */}
      
      

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
              background: spawning ? '#1a2a1a' : 'var(--primary)',
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
            {stats?.worker?.status ?? (offline ? 'bilinmiyor' : 'kontrol ediliyor…')}
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map(m => {
                const maxYear = new Date().getFullYear() - m + 1;
                return (
                  <option key={m} value={m}>{m} Sezon (Max {maxYear})</option>
                );
              })}
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
            <button
              className="admin-btn admin-btn-backup"
              onClick={handleBackup}
              disabled={loading || backupLoading}
              title="Veritabanının tarih damgalı güvenli bir yedeğini alır"
            >
              {backupLoading ? '💾 Yedekleniyor…' : '💾 Veritabanını Yedekle'}
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
              <div className="stat-num">{stats.db.ligler.length}</div>
              <div className="stat-lbl">Toplam Lig Sayısı</div>
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

          <div className="admin-date-range" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', backgroundColor: 'var(--background)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>📅 Veri Aralığı Başlangıç Tarihi:</span>
            <input
              type="text"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              placeholder="GG.AA.YYYY (Örn: 26.05.2020)"
              style={{
                backgroundColor: "var(--border)",
                border: "1px solid #3b82f6",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "700",
                width: "160px"
              }}
            />
            <button
              onClick={handleSaveStartDate}
              style={{
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(37,99,235,0.4)"
              }}
            >
              💾 Tarihi Ayarla
            </button>
            <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "auto" }}>
              Veritabanı En Yeni: <strong>{stats.db.en_yeni ?? '—'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* ── Kullanım Kılavuzu ─────────────────────────────────────── */}
              {/* LİGLER LİSTESİ */}
      {stats?.db?.ligler && stats.db.ligler.length > 0 && (
        <div className="admin-card">
          <h2 className="admin-card-title">Veritabanındaki Tüm Ligler ({stats.db.ligler.length})</h2>
          <div style={{
            display: "flex", 
            flexWrap: "wrap", 
            gap: "6px", 
            maxHeight: "300px", 
            overflowY: "auto", 
            padding: "12px",
            backgroundColor: "var(--background)",
            borderRadius: "8px",
            border: "1px solid var(--border)"
          }}>
            {stats.db.ligler.map((l: any, i: number) => (
              <span key={i} style={{
                fontSize: "11px",
                backgroundColor: "var(--border)",
                color: "#cbd5e1",
                padding: "4px 8px",
                borderRadius: "12px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                {l.lig} <span style={{color: "#64748b", fontSize: "10px", fontWeight: "bold"}}>{l.mac}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* YENİ KULLANIM KILAVUZU */}
      <div className="admin-card admin-card-info">
        <h2 className="admin-card-title">Sistem Nasıl Çalışır? (Yeni Nesil Mackolik Altyapısı)</h2>
        <ol className="admin-steps">
          <li><strong>Tamamen Otomatik:</strong> Eski manuel SofaScore/Football-Data taramaları çöpe atıldı. Sistem arka planda Mackolik CRON takvimiyle otomatik çalışır.</li>
          <li><strong>Tarihsel Madencilik:</strong> Dünden başlayarak 2021 yılına kadar geriye dönük iddaa oranlı tüm maçlar (oranlar, alt/üst, devre/maç skorları) 10 saniye aralıklarla çekilir.</li>
          <li><strong>Canlı Akış:</strong> Her 5 dakikada bir güncel maçların kapanış oranları ve gece yarısı ertesi günün bülteni otomatik güncellenir.</li>
          <li><strong>Güvenli:</strong> Sistem IP banlarına (Cloudflare WAF) karşı insan simülasyonu ve limitli isteklerle çalışır.</li>
          <li>Tüm veriler <code>scripts/scraper/gecmis_maclar.db</code> dosyasında güvendedir.</li>
        </ol>
      </div>
    </div>
    </AdminLayout>
  );
}
