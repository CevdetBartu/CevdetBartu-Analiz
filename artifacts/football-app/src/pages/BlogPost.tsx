import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { SeoHead } from "../components/seo/SeoHead";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (params?.slug) {
      fetch(`${BASE}/api/blog/${params.slug}`)
        .then(r => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        })
        .then(data => setPost(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [params?.slug]);

  if (loading) {
    return <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>Yükleniyor...</div>;
  }

  if (!post) {
    return (
      <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>
        <h1>Yazı bulunamadı.</h1>
        <Link href="/">Anasayfaya dön</Link>
      </div>
    );
  }

  const dateObj = new Date(post.created_at);
  const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Schema.org Structured Data
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image_url || "https://kargatahmin.com/default-cover.jpg",
    "datePublished": post.created_at,
    "author": {
      "@type": "Organization",
      "name": "KargaTahmin Ekibi"
    },
    "description": post.excerpt
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <SeoHead 
        title={`${post.title} - KargaTahmin`}
        description={post.excerpt}
        url={`/blog/${post.slug}`}
        type="article"
        schema={schema}
      />
      
      

      <main className="app-main" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Breadcrumb */}
        

        <article>
          <header style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.2, color: "#f8fafc", marginBottom: "16px" }}>
              {post.title}
            </h1>
            <div style={{ display: "flex", gap: "16px", color: "#64748b", fontSize: "0.95rem", alignItems: "center" }}>
              <span>📅 {formattedDate}</span>
              <span>⏱️ {post.read_time || "3 dk okuma"}</span>
              <span style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", textTransform: 'capitalize' }}>
                {post.category?.replace(/-/g, ' ')}
              </span>
            </div>
          </header>

          <div 
            style={{ 
              color: "#cbd5e1", 
              fontSize: "1.1rem", 
              lineHeight: 1.8,
              marginBottom: "40px"
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div style={{ padding: "24px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", marginBottom: "40px" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#10b981", fontSize: "1.2rem" }}>🎯 KargaTahmin Tavsiyesi</h3>
            <p style={{ margin: 0, color: "#f1f5f9", fontWeight: "bold", fontSize: "1.1rem" }}>{post.prediction}</p>
          </div>
          
          <footer style={{ borderTop: "1px solid #334155", paddingTop: "24px", color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
            <strong>Yazar:</strong> KargaTahmin Ekibi<br/><br/>
            <strong>Sorumluluk Reddi (Yasal Uyarı):</strong> Bu sayfada yer alan analizler ve tahminler tamamen istatistiksel verilere ve yapay zeka algoritmalarına dayanmaktadır. Kesinlik taşımaz ve bahis tavsiyesi niteliğinde değildir. Yasadışı bahis oynamak suçtur. Lütfen sorumlu ve yasal platformlarda hareket ediniz.
          </footer>
        </article>

      </main>
    </div>
  );
}