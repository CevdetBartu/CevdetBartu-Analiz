import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchWithAuth } from "../lib/auth";
import { Crown, Target, AlertCircle, LineChart, CheckCircle2, TrendingUp, Filter, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

export default function SuccessRatePage() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("30");

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    setLoading(true);
    try {
      // Herkese acik (fetchWithAuth da kullanilabilir ama token sart degil)
      const res = await fetch(`${BASE}/api/stats/success-rate?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Başarı oranı yüklenirken hata", e);
    } finally {
      setLoading(false);
    }
  }

  const FilterBtn = ({ val, label }: { val: string, label: string }) => (
    <button 
      onClick={() => setFilter(val)}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        filter === val 
        ? 'bg-emerald-500 text-white shadow-md' 
        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <Helmet>
        <title>Sistem Başarı Oranı - KargaTahmin</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Başlık ve Şeffaflık Metni */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
            <ShieldCheck size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Algoritmamız Ne Kadar Başarılı?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            KargaTahmin yapay zeka ve istatistik motorunun geriye dönük tahmin başarı oranlarını şeffaf bir şekilde inceliyoruz.
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left shadow-sm mt-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Şeffaflık Politikası
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sistem her maç için ürettiği olasılıklardan <strong>en yüksek olanı</strong> "sistemin ana tahmini" olarak kabul eder. (Örn: %45 Ev Sahibi, %30 Beraberlik ise sistemin tahmini MS1'dir).</li>
              <li>Oranlar, "yüksek güvenilirlikli" maçlar seçilerek filtrelenmez; analiz edilen <strong>tüm bitmiş maçlar</strong> (ertelenenler hariç) hesaplamaya dahildir.</li>
            </ul>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex justify-center gap-3 mt-8">
          <FilterBtn val="7" label="Son 7 Gün" />
          <FilterBtn val="30" label="Son 30 Gün" />
          <FilterBtn val="all" label="Tüm Zamanlar" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">Veriler Yükleniyor...</div>
        ) : !data || data.stats.total < 10 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-medium">
              <AlertCircle size={20} /> Veriler toplanıyor, yakında burada...
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="text-center text-slate-500 dark:text-slate-400">
              Şu ana kadar analiz edilen ve sonuçlanan <strong>{data.stats.total}</strong> maça göre hesaplanmıştır.
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Target size={24} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-sm tracking-wider mb-2">Maç Sonucu (MS1X2)</h3>
                <div className="text-4xl font-extrabold text-slate-800 dark:text-white">
                  %{data.stats.msRate}
                </div>
                <p className="text-xs text-slate-400 mt-2">Doğru tahmin oranı</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-2xl"></div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mb-4 relative z-10">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-sm tracking-wider mb-2 relative z-10">2.5 Alt / Üst</h3>
                <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 relative z-10">
                  %{data.stats.ouRate}
                </div>
                <p className="text-xs text-slate-400 mt-2 relative z-10">Doğru tahmin oranı</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-sm tracking-wider mb-2">Karşılıklı Gol</h3>
                <div className="text-4xl font-extrabold text-slate-800 dark:text-white">
                  %{data.stats.bttsRate}
                </div>
                <p className="text-xs text-slate-400 mt-2">Doğru tahmin oranı</p>
              </div>

            </div>

            {/* Zaman Serisi Trend Grafiği (Basit HTML/CSS Bar Chart Yedeği) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <LineChart size={20} className="text-emerald-500" /> Günlük İsabet Oranı Değişimi (Maç Sonucu)
              </h3>
              
              <div className="h-64 flex items-end gap-2 overflow-x-auto pb-4">
                {data.trend && data.trend.length > 0 ? data.trend.map((t: any, i: number) => {
                  const h = Math.max(10, (parseFloat(t.rate) / 100) * 100);
                  const isGood = parseFloat(t.rate) >= 60;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 min-w-[30px] group">
                      <div className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        %{t.rate}
                      </div>
                      <div 
                        className={`w-full rounded-t-sm transition-all ${isGood ? 'bg-emerald-400' : 'bg-blue-300 dark:bg-blue-800'}`} 
                        style={{ height: `${h}%` }}
                      ></div>
                      <div className="text-[10px] text-slate-400 mt-2 rotate-45 origin-left whitespace-nowrap">
                        {t.date.includes(".") ? t.date.slice(0,5) : t.date.slice(5)}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center text-slate-400 h-full flex flex-col justify-center">Günlük veri bulunamadı</div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
