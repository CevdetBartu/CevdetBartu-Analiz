import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "./Home.css";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const [, setLocation] = useLocation();
  const [matchCount, setMatchCount] = useState<number>(0);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch today's matches to get the total count
    fetch(`${BASE}/api/today-matches`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.matches)) {
          setMatchCount(data.matches.length);
        }
      })
      .catch((e) => console.error("Error fetching today matches", e));

    // Fetch blog posts (now includes real odds and predicted_pick)
    fetch(`${BASE}/api/blog`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setBlogPosts(data.slice(0, 3));
        }
      })
      .catch((e) => console.error("Error fetching blog posts", e));
  }, []);

  return (
    <div className="crs-home">
      <nav>
        <div className="wrap">
          <div className="logo">
            <div className="logo-mark">C</div>
            CRS Analytics
          </div>
          <div className="navlinks">
            <Link href="/bugun">Analiz Ara</Link>
            <Link href="/blog">Analizler</Link>
            <Link href="#nasil-calisir">Nasıl Çalışır</Link>
            <span className="free-badge">Şimdilik tamamen ücretsiz</span>
            <Link className="cta-btn" href="/bugun">Ücretsiz Başla</Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">
            Yeni · <b>150 referans maçlık</b> karşılaştırma motoru canlıda
          </div>
          <h1>
            Oranları tahmin etmeyin,<br />
            geçmişle <span className="accent">karşılaştırın</span>.
          </h1>
          <p className="sub">
            CRS Analytics, bugünün maç oranlarını geçmişte oynanmış binlerce maçla eşleştirir; lig, ülke ve kıta bağlamını da hesaba katarak size şeffaf bir olasılık tablosu sunar.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" href="/bugun">Ücretsiz analiz yap</Link>
            <Link className="btn-secondary" href="#nasil-calisir">Nasıl çalıştığını gör</Link>
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <b>{matchCount > 0 ? `${matchCount}+` : "..."}</b>
              <span>bugün analiz edilen maç</span>
            </div>
            <div className="hstat">
              <b>150</b>
              <span>referans maç / analiz</span>
            </div>
            <div className="hstat">
              <b>0 ₺</b>
              <span>üyelik ücreti</span>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="nasil-calisir">
        <div className="wrap">
          <div className="section-tag">NASIL ÇALIŞIR</div>
          <div className="section-title">Tek platformda, dört katmanlı analiz</div>
          <div className="section-sub">
            Her özellik, kara kutu olmadan çalışacak şekilde tasarlandı — hangi verinin sonucu nasıl etkilediğini her zaman görebilirsiniz.
          </div>
          <div className="feature-grid">
            <div className="feature">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <h3>Geçmiş oran eşleştirme</h3>
              <p>Bugünün oranları, veritabanındaki binlerce maçla olasılık bazında karşılaştırılır.</p>
            </div>
            <div className="feature">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>
              <h3>Bağlamsal filtreleme</h3>
              <p>Aynı ülke, aynı kıta ve lig seviyesi otomatik olarak benzerlik skoruna dahil edilir.</p>
            </div>
            <div className="feature">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6"><path d="M4 19V5M4 19h16M9 15l3-4 3 3 4-6"/></svg>
              <h3>Şeffaf algoritma paneli</h3>
              <p>Ham benzerlik skorunu ve uygulanan bağlamsal bonusu ayrı ayrı görürsünüz.</p>
            </div>
            <div className="feature">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>
              <h3>Risk göstergesi</h3>
              <p>Çeyrek Kelly mantığıyla hesaplanan öneri, tahmini değeri ve riski birlikte gösterir.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-tag">ADIM ADIM</div>
          <div className="section-title">Bir analiz üç adımda tamamlanır</div>
          <div className="steps">
            <div className="step">
              <div className="num">01</div>
              <h3>Maçı ara</h3>
              <p>Takım veya lig adıyla arayın; bugün oynanan {matchCount > 0 ? `${matchCount}+` : ""} maç arasından anında bulun.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Referansları inceleyin</h3>
              <p>Sistem 150 geçmiş maçı benzerlik sırasına göre listeler, her birinin bağlamını gösterir.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>Olasılığı değerlendirin</h3>
              <p>Güven aralığıyla birlikte sunulan olasılıkları kendi değerlendirmenize katın.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="stats-band">
            <div className="grid">
              <div className="item">
                <b>150</b>
                <span>referans maç / analiz</span>
              </div>
              <div className="item">
                <b>%100</b>
                <span>ücretsiz erişim</span>
              </div>
              <div className="item">
                <b>7/24</b>
                <span>güncellenen oran verisi</span>
              </div>
            </div>
            <div className="note">
              Şu an tüm özellikler herkese açık. İleride topluluğumuz büyüdükçe isteğe bağlı üyelik seçenekleri ekleyeceğiz.
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-tag">BLOG</div>
          <div className="section-title">Son analizler</div>
          <div className="section-sub">
            Öne çıkan maçlar için hazırladığımız detaylı yazılar.
          </div>
          <div className="blog-grid">
            {blogPosts.length > 0 ? (
              blogPosts.map((p, i) => (
                <Link key={i} className="blogcard" href={`/blog/${p.slug || p.id}`}>
                  <div className="meta">
                    {p.category || "Genel"} · {new Date(p.created_at).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="title">{p.title}</div>
                  <div className="oddrow">
                    <span>{p.oran_1 ? p.oran_1.toFixed(2) : "-"}</span>
                    <span>{p.oran_x ? p.oran_x.toFixed(2) : "-"}</span>
                    <span>{p.oran_2 ? p.oran_2.toFixed(2) : "-"}</span>
                  </div>
                  <div className="pick">
                    Sistem tahmini: {p.predicted_pick || "Analiz bekleniyor"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="blogcard">
                <div className="title">Blog yazısı bulunamadı.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="free-cta">
        <div className="wrap">
          <h2>Şu an tamamen ücretsiz, kayıt bile gerekmiyor</h2>
          <p>
            Markamızı büyütmeye odaklandığımız bu dönemde tüm analiz araçlarını herkese açık tutuyoruz. İleride topluluğumuzla birlikte gelişen bir üyelik sistemi de sunacağız.
          </p>
          <Link className="btn-primary" href="/bugun">Hemen bir maç analiz et</Link>
        </div>
      </section>

      <footer>
        <div className="wrap">
          CRS Analytics — İddaa oranları geçmiş verilerle karşılaştırılarak sunulur, yatırım tavsiyesi değildir.
        </div>
      </footer>
    </div>
  );
}
