import React, { useState } from 'react';
import type { AnalyzeResponse, TabloSatiri } from '@workspace/api-client-react';
import { Database, Info, ChevronRight, BarChart2 } from 'lucide-react';

interface AnalysisTableProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  analyzeResponse: AnalyzeResponse;
}

function OddsCell({ value, isWinner, isLoser, trend }: { value: string | null | undefined; isWinner: boolean; isLoser: boolean; trend?: 'up' | 'down' | 'none' }) {
  if (!value) return null;
  const cls = isWinner ? 'text-green-600 dark:text-green-400 font-bold' : isLoser ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400';
  const arrow = trend === 'up' ? <span className="text-red-500 text-[10px] ml-0.5">↑</span> : trend === 'down' ? <span className="text-emerald-500 text-[10px] ml-0.5">↓</span> : null;
  return <span className={cls}>{value}{arrow}</span>;
}

function StatRow({ label, ratio, pct, dev }: { label: string; ratio: string; pct: number; dev: number }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-1.5">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {ratio} · %{pct} <span className="text-slate-400 dark:text-slate-500">(±{dev})</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

export function AnalysisTable({ date, time, league, homeTeam, awayTeam, analyzeResponse }: AnalysisTableProps) {
  // TODO(TypeFix): Remove s any casts below once @workspace/api-client-react is fully regenerated and synced with backend openapi spec for effective_sample_size and sapma properties.
  if (!analyzeResponse) return null;
  const { analiz_ozet: ozet, tablo_satirlari } = analyzeResponse;
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH_SIM' | 'OVER_25' | 'BTTS'>('ALL');
  
  const filteredSatirlar = tablo_satirlari.filter((satir, i) => {
    if (i === 0) return false;
    if (activeTab === 'HIGH_SIM') {
      const p = parseInt((satir.analiz_yuzde || '').replace(/[^0-9]/g, ''), 10);
      return p >= 85;
    }
    if (activeTab === 'OVER_25') {
      const ms = satir.ms_skor || '';
      if (!ms.includes(':')) return false;
      const parts = ms.split(':');
      const g = (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0);
      return g >= 3;
    }
    if (activeTab === 'BTTS') {
      const ms = satir.ms_skor || '';
      if (!ms.includes(':')) return false;
      const parts = ms.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const a = parseInt(parts[1], 10) || 0;
      return h > 0 && a > 0;
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* ── Left Column: Statistical Summary Card (Mobile 100%, Desktop 1/3) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 w-full lg:w-[480px] lg:shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-baseline mb-4">
          <div>
            <h2 className="text-[15px] font-medium m-0 dark:text-slate-100">{homeTeam} — {awayTeam}</h2>
            <p className="text-xs text-slate-500 mt-1">{league} · {date}</p>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            <Database size={14} className="mr-1" /> {ozet.total_mac} benzer maç
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Info size={14} className="text-blue-500 shrink-0" />
            <span>Etkin referans büyüklüğü: <strong className="text-slate-900 dark:text-slate-200">{Math.round((ozet as any).effective_sample_size || ozet.total_mac)} maç</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 mb-5">
          <StatRow 
            label="Ev sahibi kazanır" 
            ratio={`${ozet.ev_sahibi.sayi}/${ozet.total_mac}`} 
            pct={ozet.ev_sahibi.yuzde} 
            dev={(ozet.ev_sahibi as any).sapma || 0} 
          />
          <StatRow 
            label="Beraberlik" 
            ratio={`${ozet.beraberlik.sayi}/${ozet.total_mac}`} 
            pct={ozet.beraberlik.yuzde} 
            dev={(ozet.beraberlik as any).sapma || 0} 
          />
          <StatRow 
            label="Deplasman kazanır" 
            ratio={`${ozet.deplasman.sayi}/${ozet.total_mac}`} 
            pct={ozet.deplasman.yuzde} 
            dev={(ozet.deplasman as any).sapma || 0} 
          />
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-1">
            <StatRow 
              label="2.5 üst" 
              ratio={`${ozet.ust_25.sayi}/${ozet.total_mac}`} 
              pct={ozet.ust_25.yuzde} 
              dev={(ozet.ust_25 as any).sapma || 0} 
            />
          </div>
          <StatRow 
            label="Karşılıklı gol var" 
            ratio={`${ozet.kg_var.sayi}/${ozet.total_mac}`} 
            pct={ozet.kg_var.yuzde} 
            dev={(ozet.kg_var as any).sapma || 0} 
          />
        </div>

        <a href="/metodoloji" className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 hover:underline py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="flex items-center gap-1.5"><BarChart2 size={14} /> Metodoloji ve doğruluk raporu</span>
          <ChevronRight size={14} />
        </a>
      </div>

      {/* ── Right Column: Similar Matches Table (Mobile 100%, Desktop 2/3) ── */}
      <div className="w-full flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "ALL" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            onClick={() => setActiveTab("ALL")}
          >
            TÜM ({tablo_satirlari.length - 1})
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "HIGH_SIM" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            onClick={() => setActiveTab("HIGH_SIM")}
          >
            ⚽ YÜKSEK BENZERLİK (&gt;%85)
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "OVER_25" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            onClick={() => setActiveTab("OVER_25")}
          >
            🔥 2.5 ÜST
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "BTTS" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            onClick={() => setActiveTab("BTTS")}
          >
            🤝 KG VAR
          </button>
        </div>

        {/* Legacy Table Structure Reused with Tailwind */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3 font-medium">Analiz %</th>
                <th className="p-3 font-medium">MSkor</th>
                <th className="p-3 font-medium">Benzer Karşılaşmalar</th>
                <th className="p-3 font-medium text-right">Taraf Oranları</th>
                <th className="p-3 font-medium text-right">2.5 A/Ü</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSatirlar.map((satir, idx) => {
                const t = satir.taraf_oranlari as any;
                const au = satir.alt_ust as any;
                const numPct = parseInt((satir.analiz_yuzde || "").replace(/[^0-9]/g, ""), 10) || 0;
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${numPct >= 85 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {satir.analiz_yuzde}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{satir.ms_skor}</td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300 font-medium whitespace-normal break-words max-w-[200px]">{satir.takimlar}</span>
                        <span className="text-[11px] text-slate-400">{(satir as any).lig_isim} · {(satir as any).tarih_format}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5 text-[11px] whitespace-nowrap">
                        <OddsCell value={t?.ev_kapanis} isWinner={satir.ms_skor?.startsWith("1") || false} isLoser={false} trend={t?.ev_trend as any} />
                        <OddsCell value={t?.ber_kapanis} isWinner={satir.ms_skor === "0:0" || satir.ms_skor === "1:1" || satir.ms_skor === "2:2"} isLoser={false} trend={t?.ber_trend as any} />
                        <OddsCell value={t?.dep_kapanis} isWinner={satir.ms_skor?.endsWith("2") || false} isLoser={false} trend={t?.dep_trend as any} />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5 text-[11px] whitespace-nowrap">
                        <OddsCell value={au?.alt_kapanis} isWinner={false} isLoser={false} trend={au?.alt_trend as any} />
                        <OddsCell value={au?.ust_kapanis} isWinner={false} isLoser={false} trend={au?.ust_trend as any} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSatirlar.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              Bu filtreye uygun maç bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
