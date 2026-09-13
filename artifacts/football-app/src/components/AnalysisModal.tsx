import React, { useState, useEffect } from 'react';
import { DashboardView } from './DashboardView';
import { AnalysisTable } from './AnalysisTable';
import { fetchWithAuth } from '../lib/auth';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export function AnalysisModal({ isOpen, onClose, match }: AnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [similarMatches, setSimilarMatches] = useState<any[]>([]);
  const [analyzeResponse, setAnalyzeResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'table'>('table'); // Default to AI AnalysisTable view as user expects

  const BASE_URL = import.meta.env.VITE_API_URL || "https://kargatahmin.com";

  useEffect(() => {
    if (!isOpen || !match) return;
    
    let isMounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // FindSimilarMatchesBody expects flat object
        const simPayload = {
          league: match.lig || match.league,
          oddsHome: Number(match.oddsHome || match.oran_1) || 0,
          oddsDraw: Number(match.oddsDraw || match.oran_x) || 0,
          oddsAway: Number(match.oddsAway || match.oran_2) || 0,
          altOdds: (match.altOdds || match.alt_orani) ? Number(match.altOdds || match.alt_orani) : undefined,
          ustOdds: (match.ustOdds || match.ust_orani) ? Number(match.ustOdds || match.ust_orani) : undefined,
          varOdds: (match.varOdds || match.kg_var) ? Number(match.varOdds || match.kg_var) : undefined,
          yokOdds: (match.yokOdds || match.kg_yok) ? Number(match.yokOdds || match.kg_yok) : undefined,
          maxResults: 50
        };

        const simRes = await fetchWithAuth(`${BASE_URL}/api/matches/find-similar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simPayload)
        });
        
        if (!simRes.ok) {
          const errData = await simRes.text();
          throw new Error(`Failed to fetch similar matches: ${errData}`);
        }
        const simData = await simRes.json();
        
        const flattenedSimData = simData.map((d: any) => ({
          ...d.match,
          id: d.match.id != null ? String(d.match.id) : undefined,
          similarityScore: d.similarityScore
        }));
        
        // Analyze expects { targetMatch, referenceMatches, config }
        const analyzeRes = await fetchWithAuth(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetMatch: {
              date: match.tarih || match.date,
              time: match.saat || match.time,
              league: match.lig || match.league,
              homeTeam: match.ev_sahibi || match.homeTeam,
              awayTeam: match.deplasman || match.awayTeam,
              oddsHome: (match.oddsHome || match.oran_1) ? Number(match.oddsHome || match.oran_1) : undefined,
              oddsDraw: (match.oddsDraw || match.oran_x) ? Number(match.oddsDraw || match.oran_x) : undefined,
              oddsAway: (match.oddsAway || match.oran_2) ? Number(match.oddsAway || match.oran_2) : undefined,
              altOdds: (match.altOdds || match.alt_orani) ? Number(match.altOdds || match.alt_orani) : undefined,
              ustOdds: (match.ustOdds || match.ust_orani) ? Number(match.ustOdds || match.ust_orani) : undefined,
              varOdds: (match.varOdds || match.kg_var) ? Number(match.varOdds || match.kg_var) : undefined,
              yokOdds: (match.yokOdds || match.kg_yok) ? Number(match.yokOdds || match.kg_yok) : undefined,
            },
            referenceMatches: flattenedSimData,
            config: {
              oddsWeight: 1.0,
              leagueWeight: 1.0,
              teamWeight: 1.0,
              dateWeight: 0.0,
              limit: 50,
              similarityThreshold: 0.6
            }
          })
        });

        if (!analyzeRes.ok) {
          const errData = await analyzeRes.text();
          throw new Error(`Failed to fetch analysis: ${errData}`);
        }
        
        const analysisData = await analyzeRes.json();
        
        if (isMounted) {
          setSimilarMatches(flattenedSimData);
          setAnalyzeResponse(analysisData);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, match, BASE_URL]);

  if (!isOpen || !match) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'var(--background, #0f172a)',
        borderRadius: '12px', width: '95%', maxWidth: '1400px',
        height: '95vh', display: 'flex', flexDirection: 'column', position: 'relative',
        border: '1px solid var(--border, #1e293b)',
        overflow: 'hidden'
      }}>
        {/* Header Tab Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e293b', backgroundColor: '#0b0f19' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setActiveView('table')}
              style={{
                background: activeView === 'table' ? '#3b82f6' : 'transparent',
                color: activeView === 'table' ? '#fff' : '#94a3b8',
                border: '1px solid',
                borderColor: activeView === 'table' ? '#3b82f6' : '#334155',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              🤖 Yapay Zeka Analizi (V1)
            </button>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{
                background: activeView === 'dashboard' ? '#3b82f6' : 'transparent',
                color: activeView === 'dashboard' ? '#fff' : '#94a3b8',
                border: '1px solid',
                borderColor: activeView === 'dashboard' ? '#3b82f6' : '#334155',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              📊 Tablo Görünümü (Dashboard)
            </button>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}>
            &times;
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <h2>Analiz yapılıyor...</h2>
              <p>Yapay zeka benzer maçları tarıyor ve analiz çıkarıyor.</p>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#ff4444' }}>
              <h2>Hata oluştu</h2>
              <p>{error}</p>
            </div>
          ) : !analyzeResponse ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <h2>Analiz yapılıyor...</h2>
              <p>Veriler hazırlanıyor...</p>
            </div>
          ) : (
            activeView === 'dashboard' ? (
              <DashboardView
                date={match.tarih || match.date || new Date().toISOString().split('T')[0]}
                time={match.saat || match.time || "00:00"}
                league={match.lig || match.league || "Bilinmiyor"}
                homeTeam={match.ev_sahibi || match.homeTeam || "Ev Sahibi"}
                awayTeam={match.deplasman || match.awayTeam || "Deplasman"}
                similarMatches={similarMatches}
                targetMatch={match}
                analyzeResponse={analyzeResponse}
              />
            ) : (
              <AnalysisTable
                date={match.tarih || match.date || new Date().toISOString().split('T')[0]}
                time={match.saat || match.time || "00:00"}
                league={match.lig || match.league || "Bilinmiyor"}
                homeTeam={match.ev_sahibi || match.homeTeam || "Ev Sahibi"}
                awayTeam={match.deplasman || match.awayTeam || "Deplasman"}
                analyzeResponse={analyzeResponse}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
