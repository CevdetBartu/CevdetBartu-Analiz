import React, { useState, useEffect } from "react";
import { fetchWithAuth, isAuthenticated } from "../lib/auth";
import { X, CheckCircle2, Target, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

export function PredictModal({ match, onClose }: { match: any, onClose: () => void }) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  
  // Existing predictions
  const [existingPreds, setExistingPreds] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchExisting();
    }
  }, [match]);

  async function fetchExisting() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/predictions/me?status=pending`);
      if (res.ok) {
        const data = await res.json();
        const thisMatchPreds = (data.data || []).filter((p: any) => p.ev_sahibi === match.homeTeam && p.deplasman === match.awayTeam);
        setExistingPreds(thisMatchPreds);
      }
    } catch(e) {}
  }

  async function handlePredict(type: string, value: string) {
    if (!isAuthenticated()) {
      setLocation("/login");
      return;
    }
    setLoading(true);
    setMsg("");
    setError("");
    
    try {
      const res = await fetchWithAuth(`${BASE}/api/predictions`, {
        method: 'POST',
        body: JSON.stringify({
          match_id: match.id,
          prediction_type: type,
          predicted_value: value
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Tahmin kaydedilemedi");
      } else {
        setMsg("Tahmin başarıyla kaydedildi!");
        fetchExisting();
      }
    } catch(e: any) {
      setError(e.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const isSelected = (type: string, val: string) => {
    return existingPreds.some(p => p.prediction_type === type && p.predicted_value === val);
  };

  const PredictBtn = ({ type, val, label, odds }: { type: string, val: string, label: string, odds?: number | null }) => {
    const selected = isSelected(type, val);
    return (
      <button 
        disabled={loading}
        onClick={() => handlePredict(type, val)}
        className={`flex-1 py-2 px-1 rounded-md border text-sm font-bold flex flex-col items-center justify-center transition-all ${
          selected 
          ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner' 
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
        }`}
      >
        <span>{label}</span>
        {odds && <span className={`text-xs font-normal mt-1 ${selected ? 'text-emerald-100' : 'text-slate-400'}`}>{odds.toFixed(2)}</span>}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Target className="text-emerald-500" /> Tahmin Et
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500 font-medium mb-1">{match.league}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">
              {match.homeTeam} <span className="text-slate-400 mx-2">v</span> {match.awayTeam}
            </div>
            <div className="text-sm font-semibold text-emerald-600 mt-1">{match.saat}</div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          {msg && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-sm flex items-center gap-2"><CheckCircle2 size={16}/> {msg}</div>}

          <div className="space-y-5">
            {/* Maç Sonucu */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Maç Sonucu</h3>
              <div className="flex gap-2">
                <PredictBtn type="MS1X2" val="1" label="MS 1" odds={match.oddsHome} />
                <PredictBtn type="MS1X2" val="X" label="MS X" odds={match.oddsDraw} />
                <PredictBtn type="MS1X2" val="2" label="MS 2" odds={match.oddsAway} />
              </div>
            </div>

            {/* Alt Üst */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">2.5 Alt / Üst</h3>
              <div className="flex gap-2">
                <PredictBtn type="ALT_UST_2_5" val="ALT" label="Alt" odds={match.altOdds} />
                <PredictBtn type="ALT_UST_2_5" val="UST" label="Üst" odds={match.ustOdds} />
              </div>
            </div>

            {/* KG Var Yok */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Karşılıklı Gol</h3>
              <div className="flex gap-2">
                <PredictBtn type="KG_VAR_YOK" val="VAR" label="Var" odds={match.varOdds} />
                <PredictBtn type="KG_VAR_YOK" val="YOK" label="Yok" odds={match.yokOdds} />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
