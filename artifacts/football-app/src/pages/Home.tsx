import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { isAuthenticated } from "../lib/auth";
import { Helmet } from "react-helmet-async";
import { Target, TrendingUp, Cpu, ShieldCheck, Mail, Database, Search, Percent } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const [matchCount, setMatchCount] = useState(0);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/today?date=today`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.matches) {
          setMatchCount(data.matches.length);
        }
      })
      .catch((e) => console.error("Error fetching match count", e));

    fetch(`${BASE}/api/blog/posts`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setBlogPosts(data.slice(0, 3));
        }
      })
      .catch((e) => console.error("Error fetching blog posts", e));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Helmet>
        <title>KargaTahmin - Yapay Zeka Destekli İddaa Tahmin Analizi</title>
        <meta name="description" content="Bugünün maç oranlarını geçmişteki binlerce maçla karşılaştıran yapay zeka analiz motoru." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Cpu size={16} /> Yeni Nesil AI Analiz Motoru Yayında
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Oranları tahmin etmeyin, <br/>
              geçmişle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">karşılaştırın.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              KargaTahmin, bugünün maç oranlarını geçmişte oynanmış binlerce maçla eşleştirir; lig, ülke ve kıta bağlamını da hesaba katarak size şeffaf bir olasılık tablosu sunar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/bugun" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all w-full sm:w-auto">
                {isAuthenticated() ? "Analiz Yap (Bültene Git)" : "Ücretsiz Analiz Yap"}
              </Link>
              <Link href="/basari-orani" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                <TrendingUp size={20} /> Başarı Oranımızı Gör
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900">{matchCount > 0 ? `${matchCount}+` : "..."}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Bugün Analiz Edilen Maç</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">150</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Referans Maç / Analiz</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-3xl font-black text-emerald-600">%100</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Ücretsiz Erişim</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Dört Katmanlı Analiz</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">Tek platformda şeffaf veriler</p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">Her özellik, kara kutu olmadan çalışacak şekilde tasarlandı; hangi verinin sonucu nasıl etkilediğini her zaman görebilirsiniz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geçmiş Oran Eşleştirme</h3>
              <p className="text-slate-600 leading-relaxed">Bugünün oranları, veritabanındaki binlerce maçla olasılık bazında karşılaştırılır.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bağlamsal Filtreleme</h3>
              <p className="text-slate-600 leading-relaxed">Aynı ülke, aynı kıta ve lig seviyesi otomatik olarak benzerlik skoruna dahil edilir.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Percent size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Şeffaf Algoritma Paneli</h3>
              <p className="text-slate-600 leading-relaxed">Ham benzerlik skorunu ve uygulanan bağlamsal bonusu ayrı ayrı görürsünüz.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Göstergesi</h3>
              <p className="text-slate-600 leading-relaxed">Çeyrek Kelly mantığıyla hesaplanan öneri, tahmini değeri ve riski birlikte gösterir.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Yapay Zeka Destekli Son Analizler</h2>
              <p className="mt-2 text-lg text-slate-500">Öne çıkan maçlar için hazırlanan detaylı yazılar.</p>
            </div>
            <Link href="/blog" className="hidden md:flex text-blue-600 font-semibold hover:text-blue-800 transition-colors">Tüm Blog Yazılarına Git &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.length > 0 ? (
              blogPosts.map((p, i) => (
                <Link key={i} href={`/blog/${p.slug || p.id}`} className="group bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col h-full">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                    {new Date(p.created_at).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors line-clamp-2">{p.title}</h3>
                  <div className="mt-auto">
                    <span className="inline-flex items-center text-sm font-semibold text-slate-600">Okumaya devam et &rarr;</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">Henüz yayınlanmış bir blog yazısı bulunamadı.</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/blog" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">Tüm Blog Yazılarına Git &rarr;</Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20 text-center px-4">
        <h2 className="text-3xl font-black text-white mb-6">Karşılaştırmaya Hazır Mısın?</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">KargaTahmin şu an tamamen ücretsiz. Kayıt bile gerekmiyor. Sadece maçını seç ve analiz butonuna tıkla.</p>
        <Link href="/bugun" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-all">
          Hemen Analiz Yap
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 text-center">
        <p className="text-slate-500 font-medium max-w-3xl mx-auto">
          KargaTahmin — İddaa oranları geçmiş verilerle karşılaştırılarak sunulur, yatırım tavsiyesi değildir. Olasılık hesaplamaları %100 kesinlik belirtmez.
        </p>
      </footer>
    </div>
  );
}
