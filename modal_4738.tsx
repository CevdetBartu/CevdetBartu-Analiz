import React, { useState, useEffect } from 'react';
import { DashboardView } from './DashboardView';

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

  const BASE_URL = import.meta.env.VITE_API_URL || "https://kargatahmin.com";

  useEffect(() => {
    if (!isOpen || !match) return;
    
    let isMounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Find similar matches
        const payload = {
          targetMatch: {
            date: match.tarih || match.date,
            time: match.saat || match.time,
            league: match.lig || match.league,
            homeTeam: match.ev_sahibi || match.homeTeam,
            awayTeam: match.deplasman || match.awayTeam,
            oddsHome: match.oran_1,
            oddsDraw: match.oran_x,
            oddsAway: match.oran_2,
            altOdds: match.alt_orani,
            ustOdds: match.ust_orani,
            varOdds: match.kg_var,
            yokOdds: match.kg_yok,
          },
          config: {
            oddsWeight: 1.0,
            leagueWeight: 1.0,
            teamWeight: 1.0,
            dateWeight: 0.0,
            limit: 50,
            similarityThreshold: 0.6
          }
        };

        const simRes = await fetch(`${BASE_URL}/api/matches/find-similar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!simRes.ok) throw new Error('Failed to fetch similar matches');
        const simData = await simRes.json();
        
        // 2. Analyze
        const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetMatch: payload.targetMatch,
            referenceMatches: simData,
            config: payload.config
          })
        });
        
        if (!analyzeRes.ok) throw new Error('Failed to fetch analysis');
        const analysisData = await analyzeRes.json();
        
        if (isMounted) {
          setSimilarMatches(simData);
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
        maxHeight: '95vh', overflowY: 'auto', position: 'relative',
        border: '1px solid var(--border, #1e293b)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '28px', cursor: 'pointer', zIndex: 10
        }}>
          &times;
        </button>
        
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <h2>Analiz yapÄ±lÄ±yor...</h2>
            <p>Yapay zeka benzer maÃ§larÄ± tarÄ±yor ve analiz Ã§Ä±karÄ±yor.</p>
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>
            <h2>Hata oluÅtu</h2>
            <p>{error}</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
