import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useRoute } from "wouter";
import { Calendar, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (params?.slug) {
      fetchPost(params.slug);
    }
  }, [params?.slug]);

  const fetchPost = async (slug: string) => {
    try {
      const res = await fetch(`${BASE}/api/blog/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPost(data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">İçerik Bulunamadı</h1>
        <p className="text-slate-500 mb-6">Bu yazı henüz yayınlanmamış veya silinmiş olabilir.</p>
        <a href="/blog" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Blog'a Dön</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
      <Helmet>
        <title>{post.title} - KargaTahmin Blog</title>
        <meta name="description" content={post.meta_description} />
      </Helmet>

      {/* Header Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50 py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
            Günün Maçları
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Calendar size={18}/> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
            <span>•</span>
            <span>KargaTahmin AI</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Render HTML content securely (In real prod, use DOMPurify, here we trust our own DB) */}
        <div 
          className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-strong:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Mandatory Legal Disclaimer */}
        <div className="mt-16 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Yasal Uyarı / Sorumluluk Reddi</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bu sayfada yer alan içerik, tamamen yapay zeka algoritması ve geçmiş istatistiksel veriler kullanılarak üretilmiş <strong>bilgilendirme amaçlı analizlerdir.</strong> KargaTahmin, herhangi bir şekilde bahis veya iddaa oynamaya teşvik etmez, "kesin kazanç" veya "banko" garantisi vermez. Analizler sonucunda alınacak tüm kararların sorumluluğu tamamen kullanıcının kendisine aittir. Bahis oynamak risk içerir ve bağımlılık yapabilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
