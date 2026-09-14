import React, { useEffect, useState } from 'react';
import { SeoHead } from '../components/seo/SeoHead';
import { Link } from "wouter";

export default function BlogHome() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BASE}/api/blog`);
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error("Blog yüklenemedi", e);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyBlog = async () => {
    if (!window.confirm("Bugünün maçları için otomatik blog üretilsin mi? (Bu işlem biraz vakit alabilir)")) return;
    
    setGenerating(true);
    try {
      const res = await fetch(`${BASE}/api/blog/generate-daily`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Blog yazıları başarıyla oluşturuldu!");
        fetchPosts();
      } else {
        alert("Hata: " + data.error);
      }
    } catch (e: any) {
      alert("Bir hata oluştu: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!window.confirm("Bu blog yazısını silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`${BASE}/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", backgroundColor: "#0f172a" }}>
      <SeoHead title="KargaTahmin Admin" description="Gizli alan" url="/" noindex />
      <header className="app-header">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
          <div className="logo-icon">⚽</div>
          KargaTahmin Blog
        </div>
        <nav className="header-nav">
          <Link href="/" style={{ color: "#38bdf8", fontSize: "14px", fontWeight: "bold", textDecoration: "none" }}>Anasayfa (Blog)</Link>
          <Link href="/bugun" style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>Bülten / Analiz</Link>
          <Link href="/canli" style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="live-dot" style={{ width: 8, height: 8, backgroundColor: "#ef4444", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #ef4444" }}></span>
            Canlı Maçlar
          </Link>
          <button onClick={generateDailyBlog} disabled={generating} style={{ 
            background: "linear-gradient(135deg, #6366f1, #a855f7)", 
            border: "none", 
            color: "white", 
            padding: "6px 12px", 
            borderRadius: "6px", 
            cursor: generating ? "wait" : "pointer",
            fontWeight: "bold",
            fontSize: "12px",
            marginLeft: "12px"
          }}>
            {generating ? "✍️ AI Yazıyor..." : "✨ Günün Blogunu Üret"}
          </button>
        </nav>
      </header>

      <main className="app-main" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", color: "#38bdf8", fontWeight: "bold", marginBottom: "20px" }}>
            <span>🤖 YAPAY ZEKA DESTEKLİ İDDAA TAHMİNLERİ</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: "#f8fafc", letterSpacing: "-0.02em" }}>
            Günün En Değerli Fırsatları
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            KargaTahmin algoritması ve Gemini yapay zekası tarafından özenle seçilmiş, istatistiğe dayalı günlük maç yorumları.
          </p>
        </div>

        {/* BLOG POSTS */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>Yazılar yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: 16 }}>📝</span>
            <h3 style={{ color: "#f8fafc", margin: "0 0 8px 0" }}>Henüz yazı yok</h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>Yukarıdaki "Günün Blogunu Üret" butonuna basarak yapay zekanın bugünün maçlarını analiz edip yazmasını sağlayabilirsiniz.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {posts.map(post => {
              const dateObj = new Date(post.created_at);
              const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' });

              return (
                <article key={post.id} style={{ 
                  background: "#1e293b", 
                  borderRadius: "16px", 
                  border: "1px solid #334155", 
                  padding: "28px",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    position: "absolute", top: 0, left: 0, width: "4px", height: "100%", 
                    background: "linear-gradient(to bottom, #38bdf8, #6366f1)" 
                  }}></div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "1.5rem", color: "#f1f5f9", margin: "0 0 8px 0", fontWeight: 700 }}>
                        {post.title}
                      </h2>
                      <div style={{ color: "#64748b", fontSize: "0.85rem", display: "flex", gap: "16px" }}>
                        <span>📅 {formattedDate}</span>
                        <span>✍️ AI Tipster</span>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post.id)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
                      Sil
                    </button>
                  </div>

                  <div style={{ 
                    color: "#cbd5e1", 
                    fontSize: "1.05rem", 
                    lineHeight: 1.7, 
                    background: "rgba(15, 23, 42, 0.5)", 
                    padding: "20px", 
                    borderRadius: "12px",
                    border: "1px dashed #334155",
                    marginBottom: "20px"
                  }}>
                    {post.content}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600 }}>TAVSİYE EDİLEN TERCİH:</span>
                    <span style={{ 
                      background: "rgba(16, 185, 129, 0.15)", 
                      color: "#10b981", 
                      padding: "6px 16px", 
                      borderRadius: "20px", 
                      fontWeight: 800,
                      border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}>
                      {post.prediction || "Analizden Bakınız"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}