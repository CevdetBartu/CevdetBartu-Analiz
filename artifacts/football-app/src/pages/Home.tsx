import React, { useState, useEffect } from 'react';
import { useAnalyzeMatches } from '@workspace/api-client-react';
import type { AnalyzeResponse } from '@workspace/api-client-react';
import { MatchInputForm } from '../components/MatchInputForm';
import { AnalysisTable } from '../components/AnalysisTable';
import { MatchData, SimilarMatch, createEmptySimilarMatch } from '../lib/analysis';
import { Link, useSearch } from 'wouter';

type View = 'form' | 'table';

function toApiPayload(data: MatchData) {
  const refMatches = data.similarMatches.filter(m => !m.isTargetMatch);
  const targetInfo = data.similarMatches.find(m => m.isTargetMatch);

  const parseNum = (v: string | undefined | null) => {
    if (!v) return null;
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  const parseInt2 = (v: string | undefined | null) => {
    if (!v) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  return {
    targetMatch: {
      date:           data.date   || undefined,
      time:           data.time   || undefined,
      league:         data.league || undefined,
      homeTeam:       data.homeTeam,
      awayTeam:       data.awayTeam,
      ligSirasiHome:  targetInfo ? parseInt2(targetInfo.ligSirasiHome)  : undefined,
      ligSirasiAway:  targetInfo ? parseInt2(targetInfo.ligSirasiAway)  : undefined,
      ligSirasiTotal: targetInfo ? parseInt2(targetInfo.ligSirasiTotal) : undefined,
      oddsHome:       targetInfo ? parseNum(targetInfo.oddsHome)  : undefined,
      oddsDraw:       targetInfo ? parseNum(targetInfo.oddsDraw)  : undefined,
      oddsAway:       targetInfo ? parseNum(targetInfo.oddsAway)  : undefined,
      altOdds:        targetInfo ? parseNum(targetInfo.altOdds)   : undefined,
      ustOdds:        targetInfo ? parseNum(targetInfo.ustOdds)   : undefined,
      varOdds:        targetInfo ? parseNum(targetInfo.varOdds)   : undefined,
      yokOdds:        targetInfo ? parseNum(targetInfo.yokOdds)   : undefined,
      avgOddsMin:     targetInfo ? parseNum(targetInfo.avgOddsMin): undefined,
      avgOddsMax:     targetInfo ? parseNum(targetInfo.avgOddsMax): undefined,
    },
    referenceMatches: refMatches.map(m => ({
      id:              m.id       || undefined,
      homeTeam:        m.homeTeam,
      awayTeam:        m.awayTeam,
      htScore:         m.htScore  || undefined,
      ftScore:         m.ftScore,
      previousScore:   m.previousScore || undefined,
      yellowCardsHome: parseInt2(m.yellowCardsHome),
      yellowCardsAway: parseInt2(m.yellowCardsAway),
      redCards:        parseInt2(m.redCards),
      ligSirasiHome:   parseInt2(m.ligSirasiHome),
      ligSirasiAway:   parseInt2(m.ligSirasiAway),
      ligSirasiTotal:  parseInt2(m.ligSirasiTotal),
      oddsHome:        parseNum(m.oddsHome),
      oddsDraw:        parseNum(m.oddsDraw),
      oddsAway:        parseNum(m.oddsAway),
      altOdds:         parseNum(m.altOdds),
      ustOdds:         parseNum(m.ustOdds),
      varOdds:         parseNum(m.varOdds),
      yokOdds:         parseNum(m.yokOdds),
      avgOddsMin:      parseNum(m.avgOddsMin),
      avgOddsMax:      parseNum(m.avgOddsMax),
      imResult:        m.imResult || undefined,
      kornerHome:      parseInt2(m.kornerHome),
      kornerAway:      parseInt2(m.kornerAway),
    })),
  };
}

/** URL parametrelerinden ön-doldurulmuş form verisini oluştur */
function buildInitialData(params: URLSearchParams): MatchData {
  const homeTeam = params.get('homeTeam') || '';
  const awayTeam = params.get('awayTeam') || '';
  const league   = params.get('league')   || '';
  const date     = params.get('date')     || '';
  const time     = params.get('time')     || '';

  const oddsHome = params.get('oddsHome') || '';
  const oddsDraw = params.get('oddsDraw') || '';
  const oddsAway = params.get('oddsAway') || '';
  const altOdds  = params.get('altOdds')  || '';
  const ustOdds  = params.get('ustOdds')  || '';
  const varOdds  = params.get('varOdds')  || '';
  const yokOdds  = params.get('yokOdds')  || '';

  const hasOdds = oddsHome || oddsDraw || oddsAway;
  const targetMatch: SimilarMatch = {
    ...createEmptySimilarMatch('target'),
    isTargetMatch: true,
    oddsHome: oddsHome ? parseFloat(oddsHome).toString().replace('.', ',') : '',
    oddsDraw: oddsDraw ? parseFloat(oddsDraw).toString().replace('.', ',') : '',
    oddsAway: oddsAway ? parseFloat(oddsAway).toString().replace('.', ',') : '',
    altOdds:  altOdds  ? parseFloat(altOdds).toString().replace('.', ',')  : '',
    ustOdds:  ustOdds  ? parseFloat(ustOdds).toString().replace('.', ',')  : '',
    varOdds:  varOdds  ? parseFloat(varOdds).toString().replace('.', ',')  : '',
    yokOdds:  yokOdds  ? parseFloat(yokOdds).toString().replace('.', ',')  : '',
  };

  return {
    date,
    time,
    league,
    homeTeam,
    awayTeam,
    similarMatches: hasOdds
      ? [
          targetMatch,
          createEmptySimilarMatch('1'),
          createEmptySimilarMatch('2'),
          createEmptySimilarMatch('3'),
        ]
      : [
          createEmptySimilarMatch('1'),
          createEmptySimilarMatch('2'),
          createEmptySimilarMatch('3'),
        ],
  };
}

export default function Home() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const hasQueryParams = !!(params.get('homeTeam') || params.get('awayTeam'));

  const [view, setView]           = useState<View>('form');
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [apiResult, setApiResult] = useState<AnalyzeResponse | null>(null);
  const [apiError,  setApiError]  = useState<string | null>(null);

  // Pre-fill from URL params (from today's matches page)
  const [initialData] = useState<MatchData>(() =>
    hasQueryParams ? buildInitialData(params) : {
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
    }
  );

  const mutation = useAnalyzeMatches({
    mutation: {
      onSuccess: (data) => {
        setApiResult(data);
        setView('table');
        setApiError(null);
      },
      onError: (err: any) => {
        setApiError(err?.message ?? 'Analiz sırasında bir hata oluştu.');
      },
    },
  });

  const handleAnalyze = (data: MatchData) => {
    setMatchData(data);
    const payload = toApiPayload(data);
    mutation.mutate({ data: payload });
  };

  const handleBack = () => {
    setView('form');
    setApiError(null);
  };

  return (
    <div className="app-container">
      {/* Top Nav */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">CevdetBartu Analiz</span>
        </div>
        <nav className="app-nav">
          {view === 'table' && (
            <button className="nav-btn" onClick={handleBack}>← Yeni Analiz</button>
          )}
          <Link href="/bugun" className="nav-btn" style={{ textDecoration: 'none' }}>📅 Bugünün Maçları</Link>
          <Link href="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>⚙️ Veri Havuzu</Link>
          <span className="nav-tag">CB Analiz</span>
        </nav>
      </header>

      <main className="app-main">
        {view === 'form' ? (
          <div className="form-container">
            <div className="form-hero">
              <h1 className="form-hero-title">Futbol İstatistik Analizi</h1>
              <p className="form-hero-sub">
                Hedef maç ve benzer geçmiş maç verilerini girerek istatistiksel analiz tablosu oluşturun.
                {hasQueryParams && (
                  <span style={{ color: '#28c828', marginLeft: 8 }}>
                    ✓ Maç bilgileri otomatik yüklendi
                  </span>
                )}
              </p>
            </div>

            {apiError && <div className="api-error-banner">⚠️ {apiError}</div>}

            <MatchInputForm
              onAnalyze={handleAnalyze}
              isLoading={mutation.isPending}
              initialData={initialData}
            />
          </div>
        ) : (
          matchData && apiResult && (
            <div className="table-container">
              <div className="table-actions">
                <button className="nav-btn" onClick={handleBack}>← Veri Düzenle</button>
                <button className="nav-btn-print" onClick={() => window.print()}>🖨️ Yazdır / PDF</button>
              </div>
              <AnalysisTable
                date={matchData.date}
                time={matchData.time}
                league={matchData.league}
                homeTeam={matchData.homeTeam}
                awayTeam={matchData.awayTeam}
                analyzeResponse={apiResult}
              />
            </div>
          )
        )}
      </main>
    </div>
  );
}
