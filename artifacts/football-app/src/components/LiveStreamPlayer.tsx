import React, { useState, useEffect } from 'react';

export interface LiveStreamMatch {
  id: number | string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country?: string;
  score_h: number;
  score_a: number;
  minute: number | string | null;
  status: string;
  stats?: {
    possession_h: number;
    possession_a: number;
    shots_target_h: number;
    shots_target_a: number;
    shots_total_h: number;
    shots_total_a: number;
    corners_h: number;
    corners_a: number;
    yellow_h: number;
    yellow_a: number;
    red_h: number;
    red_a: number;
    fouls_h: number;
    fouls_a: number;
    touches_in_box_h?: number;
    touches_in_box_a?: number;
  };
  pressure?: {
    home: number;
    away: number;
    tempo: number;
  };
  status_color?: {
    home: string;
    away: string;
  };
}

interface Props {
  match: LiveStreamMatch;
  onClose?: () => void;
}

export const LiveStreamPlayer: React.FC<Props> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'stats'>('pitch');
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [pitchState, setPitchState] = useState<'center' | 'attack_home' | 'danger_home' | 'attack_away' | 'danger_away'>('center');

  const stats = match.stats || {
    possession_h: 50, possession_a: 50,
    shots_target_h: 0, shots_target_a: 0,
    shots_total_h: 0, shots_total_a: 0,
    corners_h: 0, corners_a: 0,
    yellow_h: 0, yellow_a: 0,
    red_h: 0, red_a: 0,
    fouls_h: 0, fouls_a: 0,
    touches_in_box_h: 0, touches_in_box_a: 0
  };
  
  const pressure = match.pressure || { home: 50, away: 50, tempo: 50 };

  // Deriving "Attacks" from pressure/possession
  const attacksHome = Math.max(10, Math.floor((stats.possession_h / 100) * 80 + pressure.home / 2));
  const attacksAway = Math.max(10, Math.floor((stats.possession_a / 100) * 80 + pressure.away / 2));
  const dangerHome = stats.touches_in_box_h ?? Math.floor(pressure.home / 3);
  const dangerAway = stats.touches_in_box_a ?? Math.floor(pressure.away / 3);

  // Ball animation logic mimicking LMT
  useEffect(() => {
    const interval = setInterval(() => {
      const isHomeAttacking = pressure.home > pressure.away;
      let newX = 50;
      let newY = 30 + Math.random() * 40;
      let pState: typeof pitchState = 'center';

      const rand = Math.random();
      if (rand > 0.6) {
        newX = isHomeAttacking ? 85 + Math.random() * 10 : 5 + Math.random() * 10;
        pState = isHomeAttacking ? 'danger_home' : 'danger_away';
      } else if (rand > 0.3) {
        newX = isHomeAttacking ? 65 + Math.random() * 15 : 20 + Math.random() * 15;
        pState = isHomeAttacking ? 'attack_home' : 'attack_away';
      } else {
        newX = 40 + Math.random() * 20;
        pState = 'center';
      }

      setBallPos({ x: newX, y: newY });
      setPitchState(pState);
    }, 3000);

    return () => clearInterval(interval);
  }, [match.homeTeam, match.awayTeam, pressure.home, pressure.away]);

  const isHomeDir = pitchState === 'attack_home' || pitchState === 'danger_home';
  const isAwayDir = pitchState === 'attack_away' || pitchState === 'danger_away';

  // SVG background for pitch arrows
  const getPitchBackground = () => {
    const color = '#278d4a';
    if (isHomeDir) {
      return `repeating-linear-gradient(90deg, transparent, transparent 150px, rgba(255,255,255,0.08) 150px, rgba(255,255,255,0.08) 300px), linear-gradient(90deg, ${color} 0%, #1e6d38 100%)`;
    }
    if (isAwayDir) {
      return `repeating-linear-gradient(-90deg, transparent, transparent 150px, rgba(255,255,255,0.08) 150px, rgba(255,255,255,0.08) 300px), linear-gradient(-90deg, ${color} 0%, #1e6d38 100%)`;
    }
    return `linear-gradient(0deg, ${color}, ${color})`;
  };

  const getStatusText = () => {
    switch (pitchState) {
      case 'danger_home': return 'Tehlikeli Atak';
      case 'danger_away': return 'Tehlikeli Atak';
      case 'attack_home': return 'Atak';
      case 'attack_away': return 'Atak';
      default: return 'Güvenli Bölge';
    }
  };

  return (
    <div style={{
      backgroundColor: '#111520',
      borderRadius: '8px',
      overflow: 'hidden',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      marginBottom: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      {/* Pitch Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a2233' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('pitch')} style={{ background: activeTab === 'pitch' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>2D Tracker</button>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>×</button>}
      </div>

      {activeTab === 'pitch' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* LMT Pitch Area */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            background: getPitchBackground(),
            borderTop: '2px solid rgba(255,255,255,0.1)',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            transition: 'background 0.5s'
          }}>
            
            {/* Top Pill Status Indicator */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: '20px',
              overflow: 'hidden',
              fontSize: '13px',
              fontWeight: '600',
              zIndex: 10
            }}>
              <div style={{ padding: '6px 16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{getStatusText()}</div>
              <div style={{ padding: '6px 16px', color: '#22c55e' }}>{match.minute}'</div>
            </div>

            {/* Pitch Markings */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', backgroundColor: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', transform: 'translate(-50%, -50%)' }}></div>
            <div style={{ position: 'absolute', top: '20%', bottom: '20%', left: 0, width: '15%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 'none' }}></div>
            <div style={{ position: 'absolute', top: '20%', bottom: '20%', right: 0, width: '15%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 'none' }}></div>
            
            {/* Big SVG Chevrons for attacks */}
            {(isHomeDir || isAwayDir) && (
              <div style={{
                position: 'absolute',
                top: 0, bottom: 0, left: 0, right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.2,
                pointerEvents: 'none'
              }}>
                <svg width="400" height="200" viewBox="0 0 400 200">
                  {isHomeDir ? (
                    <>
                      <path d="M50,10 L150,100 L50,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                      <path d="M150,10 L250,100 L150,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                      <path d="M250,10 L350,100 L250,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                    </>
                  ) : (
                    <>
                      <path d="M350,10 L250,100 L350,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                      <path d="M250,10 L150,100 L250,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                      <path d="M150,10 L50,100 L150,190" fill="none" stroke="#fff" strokeWidth="40" strokeLinejoin="miter" />
                    </>
                  )}
                </svg>
              </div>
            )}

            {/* Glowing Ball */}
            <div style={{
              position: 'absolute',
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'all 2s cubic-bezier(0.25, 0.8, 0.25, 1)',
              boxShadow: (pitchState === 'danger_home' || pitchState === 'danger_away') 
                ? '0 0 0 6px rgba(239,68,68,0.5), 0 0 20px 10px rgba(239,68,68,0.3)' 
                : '0 0 0 4px rgba(255,255,255,0.3)'
            }}>
              {(pitchState === 'danger_home' || pitchState === 'danger_away') && (
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: '4px', height: '4px',
                  backgroundColor: '#000',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)'
                }}></div>
              )}
            </div>

          </div>

          {/* LMT Stats Table (Marsbahis Clone) */}
          <div style={{ backgroundColor: '#181f30', padding: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'normal' }}>Takımlar</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>&gt;</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>&gt;&gt;</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>📐</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#facc15' }}>🟨</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#ef4444' }}>🟥</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>🎯</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>⭕</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>⚽</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px', fontWeight: '500' }}>{match.homeTeam}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{attacksHome}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{dangerHome}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.corners_h}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.yellow_h}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.red_h}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.shots_target_h}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.shots_off_h ?? stats.shots_total_h - stats.shots_target_h}</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', color: '#22c55e' }}>{match.score_h}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: '500' }}>{match.awayTeam}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{attacksAway}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{dangerAway}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.corners_a}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.yellow_a}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.red_a}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.shots_target_a}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{stats.shots_off_a ?? stats.shots_total_a - stats.shots_target_a}</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', color: '#22c55e' }}>{match.score_a}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};
