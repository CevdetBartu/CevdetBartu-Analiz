import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchWithAuth } from "../lib/auth";
import { Crown, Target, AlertCircle, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

export default function PredictionsPage() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'resolved'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [filter, page]);

  async function loadData() {
    setLoading(true);
    try {
      const statsRes = await fetchWithAuth(`${BASE}/api/predictions/me/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      let url = `${BASE}/api/predictions/me?page=${page}`;
      if (filter !== "all") {
        url += `&status=${filter}`;
      }

      const predsRes = await fetchWithAuth(url);
      if (predsRes.ok) {
        const predsData = await predsRes.json();
        setPredictions(predsData.data || []);
        setTotalPages(predsData.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error("Tahminler yüklenirken hata", e);
    } finally {
      setLoading(false);
    }
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case "correct":
        return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle2 size={14} /> Doğru</span>;
      case "incorrect":
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><XCircle size={14} /> Yanlış</span>;
      case "void":
        return <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs font-bold"><MinusCircle size={14} /> İptal</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold"><Target size={14} /> Bekliyor</span>;
    }
  };

  const getPredictionLabel = (type: string, val: string) => {
    if (type === "MS1X2") {
      if (val === "1") return "MS 1";
      if (val === "X") return "MS X";
      if (val === "2") return "MS 2";
    }
    if (type === "KG_VAR_YOK") {
      if (val === "VAR") return "KG Var";
      if (val === "YOK") return "KG Yok";
    }
    if (type === "ALT_UST_2_5") {
      if (val === "UST") return "2.5 Üst";
      if (val === "ALT") return "2.5 Alt";
    }
    return val;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <Helmet>
        <title>Tahmin Geçmişim - KargaTahmin</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="text-emerald-500" /> Tahmin Geçmişim
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Yaptığın tahminler ve isabet oranların</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">Toplam Tahmin</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">İsabet Oranı</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">%{stats.winRate}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">Doğru / Yanlış</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                <span className="text-green-500">{stats.correct}</span>
                <span className="text-slate-300">/</span>
                <span className="text-red-500">{stats.incorrect}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">Favori Lig</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white mt-1 truncate">{stats.favoriteLeague || "-"}</div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-2">
            <button onClick={() => {setFilter("all"); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Tümü</button>
            <button onClick={() => {setFilter("pending"); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Bekleyenler</button>
            <button onClick={() => {setFilter("resolved"); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Sonuçlananlar</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Maç</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-center">Tahmin</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3 text-center">Skor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Yükleniyor...</td></tr>
                ) : predictions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Bu kritere uygun tahmin bulunamadı.</td></tr>
                ) : (
                  predictions.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                        <div className="text-xs text-slate-400">{p.lig}</div>
                        {p.ev_sahibi} - {p.deplasman}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.tarih} {p.saat}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600">
                          {getPredictionLabel(p.prediction_type, p.predicted_value)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">{renderStatus(p.status)}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-white">{p.mac_skoru || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-50 text-sm font-medium">Önceki</button>
              <span className="px-3 py-1 text-sm font-medium text-slate-500">Sayfa {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded disabled:opacity-50 text-sm font-medium">Sonraki</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
