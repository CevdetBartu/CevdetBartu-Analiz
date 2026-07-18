import React, { useState, useEffect } from 'react';
import { useAnalyzeMatches, useFindSimilarMatches } from '@workspace/api-client-react';
import type { AnalyzeResponse } from '@workspace/api-client-react';
import { MatchInputForm } from '../components/MatchInputForm';
import { AnalysisTable } from '../components/AnalysisTable';
import { DashboardView } from '../components/DashboardView';
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
  const [autoAnalyzing, setAutoAnalyzing] = useState(hasQueryParams);
  const [autoAnalyzeStep, setAutoAnalyzeStep] = useState('Analiz başlatılıyor...');
  const [displayMode, setDisplayMode] = useState<'TABLE' | 'DASHBOARD'>('TABLE');

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

  const searchMutation = useFindSimilarMatches();
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

  useEffect(() => {
    if (hasQueryParams) {
      const runAutoAnalysis = async () => {
        try {
          const mode = params.get('displayMode');
          if (mode === 'DASHBOARD' || mode === 'TABLE') {
            setDisplayMode(mode as any);
          }
          const oddsHome = parseFloat(params.get('oddsHome') || '');
          const oddsDraw = parseFloat(params.get('oddsDraw') || '');
          const oddsAway = parseFloat(params.get('oddsAway') || '');

          if (isNaN(oddsHome) || isNaN(oddsDraw) || isNaN(oddsAway)) {
            throw new Error('Otomatik benzer maç sorgulaması için 1, X, 2 oranları eksik veya geçersiz.');
          }

          setAutoAnalyzeStep('Benzer geçmiş karşılaşmalar veritabanından çekiliyor...');
          
          const similarMatchesResult = await searchMutation.mutateAsync({
            data: {
              oddsHome,
              oddsDraw,
              oddsAway,
              altOdds: params.get('altOdds') ? parseFloat(params.get('altOdds')!) : undefined,
              ustOdds: params.get('ustOdds') ? parseFloat(params.get('ustOdds')!) : undefined,
              varOdds: params.get('varOdds') ? parseFloat(params.get('varOdds')!) : undefined,
              yokOdds: params.get('yokOdds') ? parseFloat(params.get('yokOdds')!) : undefined,
              league: params.get('league') || undefined,
              maxResults: 5,
            }
          });

          if (!similarMatchesResult || similarMatchesResult.length === 0) {
            throw new Error('Veritabanında benzer oranlara sahip geçmiş karşılaşma bulunamadı.');
          }

          setAutoAnalyzeStep('İstatistiksel analiz tablosu oluşturuluyor...');

          const targetMatch = {
            date:           params.get('date') || undefined,
            time:           params.get('time') || undefined,
            league:         params.get('league') || undefined,
            homeTeam:       params.get('homeTeam') || '',
            awayTeam:       params.get('awayTeam') || '',
            oddsHome,
            oddsDraw,
            oddsAway,
            altOdds:        params.get('altOdds') ? parseFloat(params.get('altOdds')!) : undefined,
            ustOdds:        params.get('ustOdds') ? parseFloat(params.get('ustOdds')!) : undefined,
            varOdds:        params.get('varOdds') ? parseFloat(params.get('varOdds')!) : undefined,
            yokOdds:        params.get('yokOdds') ? parseFloat(params.get('yokOdds')!) : undefined,
          };

          const referenceMatches = similarMatchesResult.map((res: any) => {
            const m = res.match;
            return {
              id:              m.id?.toString(),
              homeTeam:        m.homeTeam,
              awayTeam:        m.awayTeam,
              htScore:         m.htScore || undefined,
              ftScore:         m.ftScore,
              previousScore:   m.previousScore || undefined,
              yellowCardsHome: m.yellowCardsHome,
              yellowCardsAway: m.yellowCardsAway,
              redCards:        m.redCards,
              ligSirasiHome:   m.ligSirasiHome,
              ligSirasiAway:   m.ligSirasiAway,
              ligSirasiTotal:  m.ligSirasiTotal,
              oddsHome:        m.oddsHome ? parseFloat(m.oddsHome) : undefined,
              oddsDraw:        m.oddsDraw ? parseFloat(m.oddsDraw) : undefined,
              oddsAway:        m.oddsAway ? parseFloat(m.oddsAway) : undefined,
              altOdds:         m.altOdds ? parseFloat(m.altOdds) : undefined,
              ustOdds:         m.ustOdds ? parseFloat(m.ustOdds) : undefined,
              varOdds:         m.varOdds ? parseFloat(m.varOdds) : undefined,
              yokOdds:         m.yokOdds ? parseFloat(m.yokOdds) : undefined,
              avgOddsMin:      m.avgOddsMin ? parseFloat(m.avgOddsMin) : undefined,
              avgOddsMax:      m.avgOddsMax ? parseFloat(m.avgOddsMax) : undefined,
              imResult:        m.imResult || undefined,
              kornerHome:      m.kornerHome,
              kornerAway:      m.kornerAway,
              similarityScore: res.similarityScore,
            };
          });

          await mutation.mutateAsync({
            data: {
              targetMatch,
              referenceMatches,
            }
          });

          // Set form state in case the user wants to go back to "Edit Data"
          const similarMatchesForForm: SimilarMatch[] = similarMatchesResult.map((res: any) => {
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
              matchDate: match.matchDate || '',
              league: match.league || '',
            };
          });

          const targetMatchForForm: SimilarMatch = {
            ...createEmptySimilarMatch('target'),
            isTargetMatch: true,
            oddsHome: oddsHome ? oddsHome.toString().replace('.', ',') : '',
            oddsDraw: oddsDraw ? oddsDraw.toString().replace('.', ',') : '',
            oddsAway: oddsAway ? oddsAway.toString().replace('.', ',') : '',
            altOdds:  params.get('altOdds') ? parseFloat(params.get('altOdds')!).toString().replace('.', ',') : '',
            ustOdds:  params.get('ustOdds') ? parseFloat(params.get('ustOdds')!).toString().replace('.', ',') : '',
            varOdds:  params.get('varOdds') ? parseFloat(params.get('varOdds')!).toString().replace('.', ',') : '',
            yokOdds:  params.get('yokOdds') ? parseFloat(params.get('yokOdds')!).toString().replace('.', ',') : '',
          };

          setMatchData({
            date: params.get('date') || '',
            time: params.get('time') || '',
            league: params.get('league') || '',
            homeTeam: params.get('homeTeam') || '',
            awayTeam: params.get('awayTeam') || '',
            similarMatches: [targetMatchForForm, ...similarMatchesForForm],
          });

          setAutoAnalyzing(false);
        } catch (e: any) {
          setApiError(e?.message ?? 'Otomatik analiz sırasında hata oluştu.');
          setAutoAnalyzing(false);
        }
      };
      runAutoAnalysis();
    }
  }, []);

  const handleAnalyze = (data: MatchData) => {
    setMatchData(data);
    const payload = toApiPayload(data);
    mutation.mutate({ data: payload });
  };

  const handleBack = () => {
    setView('form');
    setApiError(null);
  };

  if (autoAnalyzing) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="app-logo">
            <span className="logo-icon">⚽</span>
            <span className="logo-text">CevdetBartu Analiz</span>
          </div>
          <nav className="app-nav">
            <Link href="/bugun" className="nav-btn" style={{ textDecoration: 'none' }}>📅 Bugünün Maçları</Link>
            <Link href="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>⚙️ Veri Havuzu</Link>
          </nav>
        </header>
        <main className="app-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="loading-card" style={{
            background: 'rgba(20, 30, 48, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 50px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '550px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div className="spinner" style={{
              border: '4px solid rgba(40, 168, 40, 0.1)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              borderLeftColor: '#28c828',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px auto'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ color: '#aec6e8', fontSize: '1.35rem', fontWeight: 600, marginBottom: '12px' }}>Otomatik Analiz Başlatıldı</h2>
            <p style={{ color: '#8ab', fontSize: '0.92rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>{autoAnalyzeStep}</p>
            <div style={{
              background: '#0d131f',
              border: '1px solid #1c2635',
              padding: '12px 20px',
              borderRadius: '8px',
              color: '#5dc85d',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              display: 'inline-block'
            }}>
              {params.get('homeTeam')} — {params.get('awayTeam')}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Nav */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">CevdetBartu Analiz</span>
        </div>
        <div className="sport-tabs">
          <Link href="/" className="sport-tab active">⚽ Futbol</Link>
          <Link href="/canli" className="sport-tab">📺 Canlı Analiz</Link>
          <Link href="/dogrulama" className="sport-tab">📊 Tahmin Doğrulama</Link>
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
              initialData={matchData || initialData}
            />
          </div>
        ) : (
          matchData && apiResult && (
            <div className="table-container">
              <div className="table-actions">
                <button className="nav-btn" onClick={handleBack}>← Veri Düzenle</button>
                <button 
                  className="nav-btn" 
                  onClick={() => setDisplayMode(displayMode === 'TABLE' ? 'DASHBOARD' : 'TABLE')}
                  style={{ background: '#1c2635', border: '1px solid #384d6b' }}
                >
                  {displayMode === 'TABLE' ? '📊 Dashboard Görünümü' : '📋 Tablo Görünümü'}
                </button>
                <button className="nav-btn-print" onClick={() => window.print()}>🖨️ Yazdır / PDF</button>
              </div>
              {displayMode === 'TABLE' ? (
                <AnalysisTable
                  date={matchData.date}
                  time={matchData.time}
                  league={matchData.league}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                  analyzeResponse={apiResult}
                />
              ) : (
                <DashboardView
                  date={matchData.date}
                  time={matchData.time}
                  league={matchData.league}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                  similarMatches={matchData.similarMatches}
                />
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
