import React, { useState } from 'react';
import { BasketMatchData, BasketSimilarMatch, createEmptyBasketSimilarMatch } from '../lib/basketAnalysis';

interface BasketMatchInputFormProps {
  onAnalyze: (data: BasketMatchData) => void;
  isLoading?: boolean;
  initialData?: BasketMatchData;
}

const DEFAULT_BASKET_MATCH: BasketMatchData = {
  date: '',
  time: '',
  league: '',
  homeTeam: '',
  awayTeam: '',
  oran_1: '',
  oran_2: '',
  handikap_limit: '',
  oran_h1: '',
  oran_h2: '',
  toplam_limit: '',
  oran_alt: '',
  oran_ust: '',
  similarMatches: [
    createEmptyBasketSimilarMatch('1'),
    createEmptyBasketSimilarMatch('2'),
    createEmptyBasketSimilarMatch('3'),
  ],
};

export function BasketMatchInputForm({ onAnalyze, isLoading, initialData }: BasketMatchInputFormProps) {
  const [data, setData] = useState<BasketMatchData>(initialData ?? DEFAULT_BASKET_MATCH);
  const [searchOdds, setSearchOdds] = useState({
    oran_1: '', oran_2: ''
  });
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    const o1 = parseFloat(searchOdds.oran_1.replace(',', '.'));
    const o2 = parseFloat(searchOdds.oran_2.replace(',', '.'));

    if (isNaN(o1) || isNaN(o2)) {
      alert("Lütfen geçerli Ev Sahibi (1) ve Deplasman (2) Moneyline oranları girin.");
      return;
    }

    setSearchStatus("Arama yapılıyor...");
    try {
      const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
      const resp = await fetch(`${BASE_URL}/api/basket/matches/find-similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: data.homeTeam || 'Target',
          awayTeam: data.awayTeam || 'Target',
          league: data.league || '',
          oran_1: o1,
          oran_2: o2,
          handikap_limit: data.handikap_limit ? parseFloat(data.handikap_limit.replace(',', '.')) : null,
          toplam_limit: data.toplam_limit ? parseFloat(data.toplam_limit.replace(',', '.')) : null,
        }),
      });

      if (!resp.ok) {
        setSearchStatus("Arama başarısız.");
        return;
      }

      const results = await resp.json();
      setSearchResults(results);
      setSearchStatus(`${results.length} benzer maç bulundu.`);
    } catch (e: any) {
      setSearchStatus(`Hata: ${e.message}`);
    }
  };

  const handleFillForm = () => {
    if (searchResults.length === 0) return;

    const newMatches: BasketSimilarMatch[] = searchResults.slice(0, 30).map((res: any) => {
      const m = res.match;
      return {
        id: m.id.toString(),
        matchDate: m.matchDate || '',
        saat: m.saat || '',
        league: m.league || '',
        homeTeam: m.homeTeam || '',
        awayTeam: m.awayTeam || '',
        ftScore: m.ftScore || '',
        htScore: m.htScore || '',
        periodScores: m.periodScores || '',
        oran_1: m.oran_1?.toString().replace('.', ',') || '',
        oran_2: m.oran_2?.toString().replace('.', ',') || '',
        handikap_limit: m.handikap_limit?.toString().replace('.', ',') || '',
        oran_h1: m.oran_h1?.toString().replace('.', ',') || '',
        oran_h2: m.oran_h2?.toString().replace('.', ',') || '',
        toplam_limit: m.toplam_limit?.toString().replace('.', ',') || '',
        oran_alt: m.oran_alt?.toString().replace('.', ',') || '',
        oran_ust: m.oran_ust?.toString().replace('.', ',') || '',
        score: res.score,
      };
    });

    // Eğer 3'ten az sonuç varsa 3'e tamamla
    while (newMatches.length < 3) {
      newMatches.push(createEmptyBasketSimilarMatch((newMatches.length + 1).toString()));
    }

    setData(prev => ({ ...prev, similarMatches: newMatches }));
  };

  const updateField = (field: keyof BasketMatchData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSimilarField = (index: number, field: keyof BasketSimilarMatch, value: string) => {
    setData(prev => {
      const updated = [...prev.similarMatches];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, similarMatches: updated };
    });
  };

  const addSimilarMatch = () => {
    setData(prev => ({
      ...prev,
      similarMatches: [
        ...prev.similarMatches,
        createEmptyBasketSimilarMatch((prev.similarMatches.length + 1).toString()),
      ],
    }));
  };

  const removeSimilarMatch = (index: number) => {
    if (data.similarMatches.length <= 1) return;
    setData(prev => ({
      ...prev,
      similarMatches: prev.similarMatches.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.homeTeam || !data.awayTeam) {
      alert("Lütfen hedef maç takımlarını girin.");
      return;
    }
    onAnalyze(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── HEDEF MAÇ BİLGİLERİ ──────────────────────────────────────── */}
      <div className="form-card">
        <h3 className="form-card-title">🏀 Hedef Basketbol Maçı</h3>
        <div className="form-grid">
          <div>
            <label className="form-label">Lig / Turnuva</label>
            <input type="text" className="form-input" value={data.league} onChange={e => updateField('league', e.target.value)} placeholder="Örn: NBA, EuroLeague" />
          </div>
          <div>
            <label className="form-label">Tarih</label>
            <input type="text" className="form-input" value={data.date} onChange={e => updateField('date', e.target.value)} placeholder="Örn: 17.07.2026" />
          </div>
          <div>
            <label className="form-label">Saat</label>
            <input type="text" className="form-input" value={data.time} onChange={e => updateField('time', e.target.value)} placeholder="Örn: 21:00" />
          </div>
          <div>
            <label className="form-label">Ev Sahibi Takım</label>
            <input type="text" className="form-input" value={data.homeTeam} onChange={e => updateField('homeTeam', e.target.value)} placeholder="Örn: Fenerbahçe Beko" required />
          </div>
          <div>
            <label className="form-label">Deplasman Takım</label>
            <input type="text" className="form-input" value={data.awayTeam} onChange={e => updateField('awayTeam', e.target.value)} placeholder="Örn: Anadolu Efes" required />
          </div>
        </div>

        {/* Oran & Limit Girişi */}
        <h4 className="form-section-title" style={{ marginTop: 16 }}>Bahis Oranları & Limitleri (Bet365 / SofaScore)</h4>
        <div className="form-grid-odds" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          <div>
            <label className="form-label">Ev Kazanır (1)</label>
            <input type="text" className="form-input" value={data.oran_1} onChange={e => updateField('oran_1', e.target.value)} placeholder="Örn: 1.45" />
          </div>
          <div>
            <label className="form-label">Dep Kazanır (2)</label>
            <input type="text" className="form-input" value={data.oran_2} onChange={e => updateField('oran_2', e.target.value)} placeholder="Örn: 2.80" />
          </div>
          <div>
            <label className="form-label">Handikap Limiti</label>
            <input type="text" className="form-input" value={data.handikap_limit} onChange={e => updateField('handikap_limit', e.target.value)} placeholder="Örn: -5,5" />
          </div>
          <div>
            <label className="form-label">Ev Handikap (H1)</label>
            <input type="text" className="form-input" value={data.oran_h1} onChange={e => updateField('oran_h1', e.target.value)} placeholder="Örn: 1.90" />
          </div>
          <div>
            <label className="form-label">Dep Handikap (H2)</label>
            <input type="text" className="form-input" value={data.oran_h2} onChange={e => updateField('oran_h2', e.target.value)} placeholder="Örn: 1.90" />
          </div>
          <div>
            <label className="form-label">Toplam Sayı Limiti</label>
            <input type="text" className="form-input" value={data.toplam_limit} onChange={e => updateField('toplam_limit', e.target.value)} placeholder="Örn: 162,5" />
          </div>
          <div>
            <label className="form-label">Toplam Altı</label>
            <input type="text" className="form-input" value={data.oran_alt} onChange={e => updateField('oran_alt', e.target.value)} placeholder="Örn: 1.90" />
          </div>
          <div>
            <label className="form-label">Toplam Üstü</label>
            <input type="text" className="form-input" value={data.oran_ust} onChange={e => updateField('oran_ust', e.target.value)} placeholder="Örn: 1.90" />
          </div>
        </div>
      </div>

      {/* ── BARKOT ORANLARINA GÖRE HIZLI ARAMA ───────────────────────── */}
      <div className="form-card" style={{ background: '#131924', border: '1px dashed #2d3b55' }}>
        <h3 className="form-card-title">🔍 Veri Havuzunda Benzer Maçları Ara</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="form-label">Ev Kazanır Oranı (1)</label>
            <input type="text" className="form-input" value={searchOdds.oran_1} onChange={e => setSearchOdds(prev => ({ ...prev, oran_1: e.target.value }))} placeholder="Örn: 1.45" />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="form-label">Dep Kazanır Oranı (2)</label>
            <input type="text" className="form-input" value={searchOdds.oran_2} onChange={e => setSearchOdds(prev => ({ ...prev, oran_2: e.target.value }))} placeholder="Örn: 2.80" />
          </div>
          <button type="button" className="nav-btn" style={{ height: 42, background: '#1c2635' }} onClick={handleSearch}>Oranları Ara</button>
          {searchResults.length > 0 && (
            <button type="button" className="nav-btn" style={{ height: 42, background: '#122c19', color: '#5dc85d', border: '1px solid #28c828' }} onClick={handleFillForm}>✓ Listeyi Forma Aktar</button>
          )}
        </div>
        {searchStatus && (
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#aec6e8' }}>{searchStatus}</div>
        )}
      </div>

      {/* ── BENZER MAÇLAR GİRİŞİ ────────────────────────────────────── */}
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="form-card-title" style={{ margin: 0 }}>📊 Benzer Geçmiş Karşılaşmalar ({data.similarMatches.length} Maç)</h3>
          <button type="button" className="nav-btn" style={{ background: '#1c2635' }} onClick={addSimilarMatch}>+ Maç Ekle</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.similarMatches.map((m, idx) => (
            <div key={m.id} className="similar-match-row" style={{ padding: 16, background: '#161d2a', borderRadius: 8, border: '1px solid #232e42' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#38bdf8' }}># {idx + 1}. Karşılaşma {m.score != null && `(Benzerlik: %${m.score})`}</span>
                {data.similarMatches.length > 1 && (
                  <button type="button" className="nav-btn-print" style={{ background: '#301818', color: '#ff8888', border: '1px solid #772222', padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => removeSimilarMatch(idx)}>Kaldır</button>
                )}
              </div>

              <div className="form-grid">
                <div>
                  <label className="form-label">Lig</label>
                  <input type="text" className="form-input" value={m.league} onChange={e => updateSimilarField(idx, 'league', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Tarih</label>
                  <input type="text" className="form-input" value={m.matchDate} onChange={e => updateSimilarField(idx, 'matchDate', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Ev Sahibi</label>
                  <input type="text" className="form-input" value={m.homeTeam} onChange={e => updateSimilarField(idx, 'homeTeam', e.target.value)} placeholder="Ev Sahibi" required />
                </div>
                <div>
                  <label className="form-label">Deplasman</label>
                  <input type="text" className="form-input" value={m.awayTeam} onChange={e => updateSimilarField(idx, 'awayTeam', e.target.value)} placeholder="Deplasman" required />
                </div>
                <div>
                  <label className="form-label">MS Skoru</label>
                  <input type="text" className="form-input" value={m.ftScore} onChange={e => updateSimilarField(idx, 'ftScore', e.target.value)} placeholder="Örn: 92:88" required />
                </div>
                <div>
                  <label className="form-label">IY Skoru</label>
                  <input type="text" className="form-input" value={m.htScore} onChange={e => updateSimilarField(idx, 'htScore', e.target.value)} placeholder="Örn: 48:42" />
                </div>
                <div>
                  <label className="form-label">Periyotlar</label>
                  <input type="text" className="form-input" value={m.periodScores} onChange={e => updateSimilarField(idx, 'periodScores', e.target.value)} placeholder="Örn: 22:18, 26:24, 20:20, 24:26" />
                </div>
                <div>
                  <label className="form-label">Ev Kazanır (1)</label>
                  <input type="text" className="form-input" value={m.oran_1} onChange={e => updateSimilarField(idx, 'oran_1', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Dep Kazanır (2)</label>
                  <input type="text" className="form-input" value={m.oran_2} onChange={e => updateSimilarField(idx, 'oran_2', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Handikap Limiti</label>
                  <input type="text" className="form-input" value={m.handikap_limit} onChange={e => updateSimilarField(idx, 'handikap_limit', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Ev Handikap (H1)</label>
                  <input type="text" className="form-input" value={m.oran_h1} onChange={e => updateSimilarField(idx, 'oran_h1', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Dep Handikap (H2)</label>
                  <input type="text" className="form-input" value={m.oran_h2} onChange={e => updateSimilarField(idx, 'oran_h2', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Toplam Sayı Limiti</label>
                  <input type="text" className="form-input" value={m.toplam_limit} onChange={e => updateSimilarField(idx, 'toplam_limit', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Toplam Altı</label>
                  <input type="text" className="form-input" value={m.oran_alt} onChange={e => updateSimilarField(idx, 'oran_alt', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Toplam Üstü</label>
                  <input type="text" className="form-input" value={m.oran_ust} onChange={e => updateSimilarField(idx, 'oran_ust', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gönder butonu */}
      <button type="submit" className="form-submit-btn" disabled={isLoading} style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }}>
        {isLoading ? 'Analiz Ediliyor...' : '🏀 Basketbol Maçlarını Analiz Et'}
      </button>
    </form>
  );
}
