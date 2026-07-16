import React, { useState } from 'react';
import { MatchData, SimilarMatch, createEmptySimilarMatch } from '../lib/analysis';
import { useFindSimilarMatches } from '@workspace/api-client-react';

interface MatchInputFormProps {
  onAnalyze: (data: MatchData) => void;
  isLoading?: boolean;
  initialData?: MatchData;
}

const DEFAULT_MATCH: MatchData = {
  date: '',
  time: '',
  league: '',
  homeTeam: '',
  awayTeam: '',
  similarMatches: [
    createEmptySimilarMatch('1'),
    createEmptySimilarMatch('2'),
    createEmptySimilarMatch('3'),
  ],
};

export function MatchInputForm({ onAnalyze, isLoading, initialData }: MatchInputFormProps) {
  const [data, setData] = useState<MatchData>(initialData ?? DEFAULT_MATCH);
  const [searchOdds, setSearchOdds] = useState({
    oddsHome: '', oddsDraw: '', oddsAway: '',
    altOdds: '', ustOdds: '', varOdds: '', yokOdds: ''
  });
  const [searchFilters, setSearchFilters] = useState({
    ligSirasiDiff: '', avgCardsTotal: '', maxResults: '5'
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const searchMutation = useFindSimilarMatches();

  const handleSearch = () => {
    const oddsHome = parseFloat(searchOdds.oddsHome.replace(',', '.'));
    const oddsDraw = parseFloat(searchOdds.oddsDraw.replace(',', '.'));
    const oddsAway = parseFloat(searchOdds.oddsAway.replace(',', '.'));

    if (isNaN(oddsHome) || isNaN(oddsDraw) || isNaN(oddsAway)) {
      alert("Lütfen en azından 1, X ve 2 oranlarını geçerli sayılar olarak girin.");
      return;
    }

    searchMutation.mutate({
      data: {
        oddsHome,
        oddsDraw,
        oddsAway,
        altOdds: searchOdds.altOdds ? parseFloat(searchOdds.altOdds.replace(',', '.')) : undefined,
        ustOdds: searchOdds.ustOdds ? parseFloat(searchOdds.ustOdds.replace(',', '.')) : undefined,
        varOdds: searchOdds.varOdds ? parseFloat(searchOdds.varOdds.replace(',', '.')) : undefined,
        yokOdds: searchOdds.yokOdds ? parseFloat(searchOdds.yokOdds.replace(',', '.')) : undefined,
        league: data.league || undefined,
        ligSirasiDiff: searchFilters.ligSirasiDiff ? parseInt(searchFilters.ligSirasiDiff) : undefined,
        avgCardsTotal: searchFilters.avgCardsTotal ? parseFloat(searchFilters.avgCardsTotal) : undefined,
        maxResults: parseInt(searchFilters.maxResults),
      }
    });
  };

  const handleFillForm = () => {
    if (!searchMutation.data) return;

    const newMatches: SimilarMatch[] = searchMutation.data.map((res: any) => {
      const match = res.match;
      return {
        id: match.id.toString(),
        homeTeam: match.homeTeam || '',
        awayTeam: match.awayTeam || '',
        htScore: match.htScore || '',
        ftScore: match.ftScore || '',
        previousScore: match.previousScore || '',
        yellowCardsHome: match.yellowCardsHome?.toString() || '',
        yellowCardsAway: match.yellowCardsAway?.toString() || '',
        redCards: match.redCards?.toString() || '0',
        ligSirasiHome: match.ligSirasiHome?.toString() || '',
        ligSirasiAway: match.ligSirasiAway?.toString() || '',
        ligSirasiTotal: match.ligSirasiTotal?.toString() || '20',
        oddsHome: match.oddsHome?.toString().replace('.', ',') || '',
        oddsDraw: match.oddsDraw?.toString().replace('.', ',') || '',
        oddsAway: match.oddsAway?.toString().replace('.', ',') || '',
        altOdds: match.altOdds?.toString().replace('.', ',') || '',
        ustOdds: match.ustOdds?.toString().replace('.', ',') || '',
        varOdds: match.varOdds?.toString().replace('.', ',') || '',
        yokOdds: match.yokOdds?.toString().replace('.', ',') || '',
        avgOddsMin: match.avgOddsMin?.toString().replace('.', ',') || '',
        avgOddsMax: match.avgOddsMax?.toString().replace('.', ',') || '',
        imResult: match.imResult || '',
        kornerHome: match.kornerHome?.toString() || '',
        kornerAway: match.kornerAway?.toString() || '',
      };
    });

    setData(prev => ({ ...prev, similarMatches: newMatches }));
  };

  const updateField = (field: keyof MatchData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateMatch = (id: string, field: keyof SimilarMatch, value: string) => {
    setData(prev => ({
      ...prev,
      similarMatches: prev.similarMatches.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  const addMatch = () => {
    const newId = Date.now().toString();
    setData(prev => ({
      ...prev,
      similarMatches: [...prev.similarMatches, createEmptySimilarMatch(newId)],
    }));
  };

  const removeMatch = (id: string) => {
    setData(prev => ({
      ...prev,
      similarMatches: prev.similarMatches.filter(m => m.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(data);
  };

  const inputCls = "form-input";
  const labelCls = "form-label";

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div className="form-section">
        <h3 className="form-section-title">Hedef Maç Bilgileri</h3>
        <div className="form-grid-4">
          <div className="form-field">
            <label className={labelCls}>Tarih</label>
            <input className={inputCls} type="text" placeholder="15 Temmuz" value={data.date} onChange={e => updateField('date', e.target.value)} />
          </div>
          <div className="form-field">
            <label className={labelCls}>Saat</label>
            <input className={inputCls} type="text" placeholder="21:00" value={data.time} onChange={e => updateField('time', e.target.value)} />
          </div>
          <div className="form-field col-span-2">
            <label className={labelCls}>Lig</label>
            <input className={inputCls} type="text" placeholder="Türkiye Süper Lig" value={data.league} onChange={e => updateField('league', e.target.value)} />
          </div>
        </div>
        <div className="form-grid-2 mt-2">
          <div className="form-field">
            <label className={labelCls}>Ev Sahibi</label>
            <input className={inputCls} type="text" placeholder="Galatasaray" value={data.homeTeam} onChange={e => updateField('homeTeam', e.target.value)} />
          </div>
          <div className="form-field">
            <label className={labelCls}>Deplasman</label>
            <input className={inputCls} type="text" placeholder="Fenerbahçe" value={data.awayTeam} onChange={e => updateField('awayTeam', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Otomatik Benzer Maç Araması</h3>

        <div className="form-grid-4">
          <div className="form-field">
            <label className={labelCls}>Oran 1</label>
            <input className={inputCls} placeholder="1.63" value={searchOdds.oddsHome} onChange={e => setSearchOdds({...searchOdds, oddsHome: e.target.value})} />
          </div>
          <div className="form-field">
            <label className={labelCls}>Oran X</label>
            <input className={inputCls} placeholder="3.10" value={searchOdds.oddsDraw} onChange={e => setSearchOdds({...searchOdds, oddsDraw: e.target.value})} />
          </div>
          <div className="form-field">
            <label className={labelCls}>Oran 2</label>
            <input className={inputCls} placeholder="3.43" value={searchOdds.oddsAway} onChange={e => setSearchOdds({...searchOdds, oddsAway: e.target.value})} />
          </div>
        </div>

        <div className="form-grid-4 mt-2">
          <div className="form-field">
            <label className={labelCls}>Alt Oranı</label>
            <input className={inputCls} placeholder="1.35" value={searchOdds.altOdds} onChange={e => setSearchOdds({...searchOdds, altOdds: e.target.value})} />
          </div>
          <div className="form-field">
            <label className={labelCls}>Üst Oranı</label>
            <input className={inputCls} placeholder="2.08" value={searchOdds.ustOdds} onChange={e => setSearchOdds({...searchOdds, ustOdds: e.target.value})} />
          </div>
          <div className="form-field">
            <label className={labelCls}>KG Var</label>
            <input className={inputCls} placeholder="1.91" value={searchOdds.varOdds} onChange={e => setSearchOdds({...searchOdds, varOdds: e.target.value})} />
          </div>
          <div className="form-field">
            <label className={labelCls}>KG Yok</label>
            <input className={inputCls} placeholder="1.42" value={searchOdds.yokOdds} onChange={e => setSearchOdds({...searchOdds, yokOdds: e.target.value})} />
          </div>
        </div>

        <div className="mt-4">
          <button type="button" className="btn-filter-toggle" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            {isFiltersOpen ? '▼ Gelişmiş Filtreleri Gizle' : '▶ Gelişmiş Filtreleri Göster'}
          </button>
        </div>

        {isFiltersOpen && (
          <div className="form-grid-4 mt-2 filter-panel">
            <div className="form-field">
              <label className={labelCls}>Lig</label>
              <input className={inputCls} value={data.league} onChange={e => updateField('league', e.target.value)} placeholder="Türkiye Süper Lig" />
            </div>
            <div className="form-field">
              <label className={labelCls}>Lig Sırası Farkı</label>
              <input className={inputCls} value={searchFilters.ligSirasiDiff} onChange={e => setSearchFilters({...searchFilters, ligSirasiDiff: e.target.value})} placeholder="15" type="number" />
            </div>
            <div className="form-field">
              <label className={labelCls}>Ortalama Kart</label>
              <input className={inputCls} value={searchFilters.avgCardsTotal} onChange={e => setSearchFilters({...searchFilters, avgCardsTotal: e.target.value})} placeholder="6" type="number" />
            </div>
            <div className="form-field">
              <label className={labelCls}>Sonuç Sayısı</label>
              <select className={inputCls} value={searchFilters.maxResults} onChange={e => setSearchFilters({...searchFilters, maxResults: e.target.value})}>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button type="button" className="btn-search" onClick={handleSearch} disabled={searchMutation.isPending}>
            {searchMutation.isPending ? '⏳ Aranıyor...' : '🔍 Benzer Maçları Bul'}
          </button>
        </div>

        {searchMutation.data && (
          <div className="search-results mt-4">
            <h4 className="results-title">Bulunan Maçlar</h4>
            <div className="results-list">
              {searchMutation.data.map((res: any, idx: number) => {
                const match = res.match;
                let scoreColor = 'score-red';
                if (res.similarityScore >= 70) scoreColor = 'score-green';
                else if (res.similarityScore >= 50) scoreColor = 'score-yellow';

                return (
                  <div key={match.id} className="result-item">
                    <div className="result-header">
                      <span className="result-rank">#{idx + 1}</span>
                      <div className="result-score-bar-container">
                        <div className={`result-score-bar ${scoreColor}`} style={{ width: `${res.similarityScore}%` }}></div>
                        <span className="result-score-text">%{res.similarityScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="result-teams">
                      {match.homeTeam} <strong>{match.ftScore}</strong> {match.awayTeam}
                    </div>
                    <div className="result-league">{match.league}</div>
                    <div className="result-breakdown">
                      Oran: {(res.scoreBreakdown.oddsScore).toFixed(1)}/60 |
                      Lig: {(res.scoreBreakdown.leagueScore).toFixed(1)}/20 |
                      Kart: {(res.scoreBreakdown.cardScore).toFixed(1)}/20
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <button type="button" className="btn-fill" onClick={handleFillForm}>
                ✓ Formu Doldur
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Benzer Geçmiş Maçlar</h3>
        <p className="form-hint">
          Her satır, benzer koşullarda oynanmış bir geçmiş maçı temsil eder.
          Skor alanlarını <strong>X:Y</strong> formatında girin (örn: <strong>2:1</strong>).
        </p>

        {data.similarMatches.map((m, idx) => (
          <div key={m.id} className="match-row-card">
            <div className="match-row-header">
              <span className="match-row-num">#{idx + 1}</span>
              <button type="button" className="btn-remove" onClick={() => removeMatch(m.id)}>✕ Sil</button>
            </div>

            {/* Teams + Scores */}
            <div className="form-grid-4">
              <div className="form-field">
                <label className={labelCls}>Ev Sahibi</label>
                <input className={inputCls} type="text" placeholder="GALA" value={m.homeTeam} onChange={e => updateMatch(m.id, 'homeTeam', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Deplasman</label>
                <input className={inputCls} type="text" placeholder="ANTAL" value={m.awayTeam} onChange={e => updateMatch(m.id, 'awayTeam', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Devre Skoru (İY)</label>
                <input className={inputCls} type="text" placeholder="1:0" value={m.htScore} onChange={e => updateMatch(m.id, 'htScore', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Maç Skoru (MS)</label>
                <input className={inputCls} type="text" placeholder="3:1" value={m.ftScore} onChange={e => updateMatch(m.id, 'ftScore', e.target.value)} />
              </div>
            </div>

            {/* Previous + Cards + League */}
            <div className="form-grid-4 mt-2">
              <div className="form-field">
                <label className={labelCls}>Önceki Skor</label>
                <input className={inputCls} type="text" placeholder="4:1 - 2:0" value={m.previousScore} onChange={e => updateMatch(m.id, 'previousScore', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Kart (Ev)</label>
                <input className={inputCls} type="text" placeholder="03" value={m.yellowCardsHome} onChange={e => updateMatch(m.id, 'yellowCardsHome', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Kart (Dep)</label>
                <input className={inputCls} type="text" placeholder="03" value={m.yellowCardsAway} onChange={e => updateMatch(m.id, 'yellowCardsAway', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Kırmızı Kart</label>
                <input className={inputCls} type="text" placeholder="0" value={m.redCards} onChange={e => updateMatch(m.id, 'redCards', e.target.value)} />
              </div>
            </div>

            {/* League Position + i/m */}
            <div className="form-grid-4 mt-2">
              <div className="form-field">
                <label className={labelCls}>Lig Sıra (Ev)</label>
                <input className={inputCls} type="text" placeholder="01" value={m.ligSirasiHome} onChange={e => updateMatch(m.id, 'ligSirasiHome', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Lig Sıra (Dep)</label>
                <input className={inputCls} type="text" placeholder="14" value={m.ligSirasiAway} onChange={e => updateMatch(m.id, 'ligSirasiAway', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Toplam Takım</label>
                <input className={inputCls} type="text" placeholder="20" value={m.ligSirasiTotal} onChange={e => updateMatch(m.id, 'ligSirasiTotal', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>i/m - 6+</label>
                <input className={inputCls} type="text" placeholder="1/1" value={m.imResult} onChange={e => updateMatch(m.id, 'imResult', e.target.value)} />
              </div>
            </div>

            {/* Odds */}
            <div className="form-grid-odds mt-2">
              <div className="form-field">
                <label className={labelCls}>Oran 1</label>
                <input className={inputCls} type="text" placeholder="1,63" value={m.oddsHome} onChange={e => updateMatch(m.id, 'oddsHome', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Oran X</label>
                <input className={inputCls} type="text" placeholder="3,10" value={m.oddsDraw} onChange={e => updateMatch(m.id, 'oddsDraw', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Oran 2</label>
                <input className={inputCls} type="text" placeholder="3,43" value={m.oddsAway} onChange={e => updateMatch(m.id, 'oddsAway', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Alt</label>
                <input className={inputCls} type="text" placeholder="1,35" value={m.altOdds} onChange={e => updateMatch(m.id, 'altOdds', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Üst</label>
                <input className={inputCls} type="text" placeholder="2,08" value={m.ustOdds} onChange={e => updateMatch(m.id, 'ustOdds', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Var</label>
                <input className={inputCls} type="text" placeholder="1,91" value={m.varOdds} onChange={e => updateMatch(m.id, 'varOdds', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Yok</label>
                <input className={inputCls} type="text" placeholder="1,42" value={m.yokOdds} onChange={e => updateMatch(m.id, 'yokOdds', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Ort. Min</label>
                <input className={inputCls} type="text" placeholder="1,00" value={m.avgOddsMin} onChange={e => updateMatch(m.id, 'avgOddsMin', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Ort. Max</label>
                <input className={inputCls} type="text" placeholder="1,21" value={m.avgOddsMax} onChange={e => updateMatch(m.id, 'avgOddsMax', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Korner Ev</label>
                <input className={inputCls} type="text" placeholder="5" value={m.kornerHome} onChange={e => updateMatch(m.id, 'kornerHome', e.target.value)} />
              </div>
              <div className="form-field">
                <label className={labelCls}>Korner Dep</label>
                <input className={inputCls} type="text" placeholder="4" value={m.kornerAway} onChange={e => updateMatch(m.id, 'kornerAway', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-match" onClick={addMatch}>+ Maç Ekle</button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-analyze">ANALİZ TABLOSUNU OLUŞTUR</button>
      </div>
    </form>
  );
}
