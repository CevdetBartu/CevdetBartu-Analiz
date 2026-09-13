import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { SeoHead } from "../components/seo/SeoHead";

export default function CategoryPage() {
  const [match, params] = useRoute("/kategori/:slug");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const categoryName = params?.slug ? params.slug.replace(/-/g, ' ') : '';
  const titleCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  useEffect(() => {
    if (params?.slug) {
      // In a real app we would have a backend route like /api/blog/category/:slug
      // For now, we will fetch all and filter client side just to get the structure working
      fetch(`${BASE}/api/blog`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPosts(data.filter(p => p.category === params.slug));
          }
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [params?.slug]);

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <SeoHead 
        title={`${titleCategory} İddaa Tahminleri ve Analizleri - KargaTahmin`}
        description={`${titleCategory} ligindeki en güncel maç analizleri, istatistikler ve yapay zeka destekli tahminler. ${titleCategory} maçları için banko kupon önerileri.`}
        url={`/kategori/${params?.slug}`}
      />
      
      <header className="app-header">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
          <div className="logo-icon">⚽</div>
          KargaTahmin
        </div>
        <nav className="header-nav">
          <Link href="/" style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>Anasayfa (Blog)</Link>
        </nav>
      </header>

      <main className="app-main" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: "2.5rem", color: "#f8fafc", marginBottom: "32px", textTransform: 'capitalize' }}>
          {categoryName} İddaa Tahminleri
        </h1>

        {loading ? (
          <div style={{ color: "#94a3b8" }}>Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: "#94a3b8", padding: "40px 0" }}>Bu kategoride henüz yazı bulunmamaktadır.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ 
                  background: "#1e293b", 
                  borderRadius: "16px", 
                  border: "1px solid #334155", 
                  padding: "24px",
                  height: "100%",
                  transition: "transform 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: "bold", textTransform: 'capitalize' }}>{post.category?.replace(/-/g, ' ')}</span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", color: "#f1f5f9", margin: "0 0 12px 0", lineHeight: 1.4 }}>{post.title}</h2>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                    {post.excerpt}
                  </p>
                  <div style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: "bold" }}>
                    Yazıyı Oku →
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}