import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from "wouter";
import { Calendar, Clock, ChevronRight } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function BlogHome() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BASE}/api/blog`);
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 pb-20">
      <Helmet><title>İddaa Analizleri ve Günün Maçları - KargaTahmin Blog</title></Helmet>

      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Yapay Zeka Destekli <span className="text-primary">Maç Analizleri</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Günün öne çıkan maçları için KargaTahmin algoritması tarafından üretilmiş istatistiksel olasılık değerlendirmeleri.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Henüz Yazı Yok</h3>
            <p className="text-slate-500">Çok yakında yeni analizler burada olacak.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <article key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-colors group">
                <Link href={`/blog/${post.slug}`} className="block p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                    {post.meta_description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar size={16}/> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                      <span className="flex items-center gap-1.5"><Clock size={16}/> 3 dk okuma</span>
                    </div>
                    <span className="flex items-center gap-1 text-primary font-bold text-sm">
                      Devamını Oku <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
