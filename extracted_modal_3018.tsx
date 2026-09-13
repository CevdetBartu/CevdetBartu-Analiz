import React from 'react';
import { DashboardView } from './DashboardView';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any; // Type it properly if needed
}

export function AnalysisModal({ isOpen, onClose, match }: AnalysisModalProps) {
  if (!isOpen || !match) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'var(--background, #0f172a)', padding: '24px',
        borderRadius: '12px', width: '90%', maxWidth: '1200px',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        border: '1px solid var(--border, #1e293b)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '24px', cursor: 'pointer'
        }}>
          &times;
        </button>
        <DashboardView
          date={match.date || new Date().toISOString().split('T')[0]}
          time={match.time || "00:00"}
          league={match.league || match.l || "Bilinmiyor"}
          homeTeam={match.homeTeam || match.h || "Ev Sahibi"}
          awayTeam={match.awayTeam || match.a || "Deplasman"}
          similarMatches={[]} // In a real app, this would fetch analysis data
          targetMatch={null}
        />
      </div>
    </div>
  );
}
