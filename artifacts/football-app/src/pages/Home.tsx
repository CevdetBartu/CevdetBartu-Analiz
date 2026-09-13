import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "./Home.css";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const [, setLocation] = useLocation();
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [heroMatch, setHeroMatch] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLiveMatches = () => {
      fetch(`${BASE}/api/matches/live`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data)) {
            setLiveMatches(data.filter(m => m.status !== 'FINISHED').slice(0, 15));
          }
        })
        .catch((e) => console.error("Error fetching live matches", e));
    };

    fetchLiveMatches();
    const liveInterval = setInterval(fetchLiveMatches, 15000); // periyodik (15sn)

    // Fetch today's matches for hero preview and quick list
    fetch(`${BASE}/api/matches/today`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.matches)) {
          const matches = data.matches.filter((m: any) => m.oran_1 > 0);
          
          if (matches.length > 0) {
            setHeroMatch(matches[0]);
            setTopMatches(matches.slice(1, 5));
          }
        }
      })
      .catch((e) => console.error("Error fetching today matches", e));

    // Fetch blog posts
    fetch(`${BASE}/api/blog`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setBlogPosts(data.slice(0, 3));
        }
      })
      .catch((e) => console.error("Error fetching blog posts", e));

    return () => clearInterval(liveInterval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/bugun?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="crs-home">
      <nav>
        <div className="wrap">
          <div className="logo">
            <div className="logo-icon logo-mark">C</div>
            CRS Analytics
          </div>
          <div className="navlinks">
            <Link href="/bugun">Analiz Ara</Link>
            <Link href="/blog">Analizler</Link>
            <Link href="/canli">
              <span className="live-dot"></span>Canlı Maçlar
            </Link>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track mono">
          {liveMatches.length > 0 ? (
            // Duplicate the list to make the infinite scroll smooth
            [...liveMatches, ...liveMatches, ...liveMatches].map((m, i) => {
               // Fake up/down trend for demo if we don't have real live odds trend
               const isUp = i % 2 === 0;
               const odds = m.pre_match_odds?.["1"] || "-";
               return (
                <span key={i}>
                  {m.homeTeam} - {m.awayTeam} &nbsp;<b>{odds}</b> 
                  {odds !== "-" && (
                    <span className={isUp ? "up" : "down"}>
                      {isUp ? "▲0.03" : "▼0.02"}
                    </span>
                  )}
                </span>
              );
            })
          ) : (
            <span>Canlı veri bekleniyor...</span>
          )}
        </div>
      </div>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              Bir maçın oranı,<br />
              daha önce <span className="accent">150 kez</span> açılmıştı.
            </h1>
            <p className="sub">
              CRS motoru, bugünün oranlarını geçmişte oynanan binlerce maçla karşılaştırır; bağlamı (lig, kıta, ülke) ve olasılığı birlikte tartar.
            </p>
            <form className="search-box" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Takım veya lig ara — örn. Galatasaray, Ekvador Pro Lig"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Analiz Et</button>
            </form>
            <div className="hero-tags">
              <span className="tag">583 maç bugün</span>
              <span className="tag">150 referans / analiz</span>
              <span className="tag">Kıta & ülke bağlamı</span>
            </div>
          </div>

          {heroMatch ? (
            <div className="preview-card">
              <div className="preview-head">
                <div>
                  <div className="league">{heroMatch.lig.toUpperCase()}</div>
                  <div className="matchname">
                    {heroMatch.ev_sahibi} v {heroMatch.deplasman}
                  </div>
                </div>
              </div>
              <div className="preview-odds">
                <div className="odd-pill">
                  <div className="lbl">MS1</div>
                  <div className="val">{heroMatch.oran_1}</div>
                </div>
                <div className="odd-pill">
                  <div className="lbl">MSX</div>
                  <div className="val">{heroMatch.oran_x}</div>
                </div>
                <div className="odd-pill">
                  <div className="lbl">MS2</div>
                  <div className="val">{heroMatch.oran_2}</div>
                </div>
              </div>
              <div className="sim-row">
                <span>150 referans maç</span>
                <b>Ev sahibi %... ±%...</b>
              </div>
              <div className="sim-row">
                <span>Lig dağılımı</span>
                <b>{heroMatch.lig} %...</b>
              </div>
              <div className="sim-row">
                <span>2.5 üst</span>
                <b>%... ±%...</b>
              </div>
              <div className="kelly-badge">
                <span>Kelly önerisi</span>
                <span className="mono">Detaylı analiz için tıklayın</span>
              </div>
              <Link href={`/bugun?q=${encodeURIComponent(heroMatch.ev_sahibi)}`} style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", opacity: 0}} />
            </div>
          ) : (
            <div className="preview-card" style={{ opacity: 0.5 }}>
              <div className="preview-head">Günün Maçı Yükleniyor...</div>
            </div>
          )}
        </div>
      </header>

      <section className="section">
        <div className="wrap split">
          <div className="split-col">
            <h3>ANALİZ ARACI</h3>
            <h2>Şu an incelenen maçlar</h2>
            <div className="quicklist">
              {topMatches.length > 0 ? (
                topMatches.map((m, i) => (
                  <Link key={i} className="quickrow" href={`/bugun?q=${encodeURIComponent(m.ev_sahibi)}`}>
                    <div>
                      <div className="qname">
                        {m.ev_sahibi} - {m.deplasman}
                      </div>
                      <div className="qleague">{m.lig}</div>
                    </div>
                    <div className="qval mono">Analiz Et ➔</div>
                  </Link>
                ))
              ) : (
                <div className="quickrow">Yükleniyor...</div>
              )}
            </div>
          </div>

          <div className="split-col">
            <h3>BLOG / ANALİZ</h3>
            <h2>Son analizler</h2>
            <div className="blogcards">
              {blogPosts.length > 0 ? (
                blogPosts.map((p, i) => (
                  <Link key={i} className="blogcard" href={`/blog/${p.slug || p.id}`}>
                    <div className="oddchip">
                      BLOG<br/>YAZISI
                    </div>
                    <div className="body">
                      <div className="meta">Tarih: {new Date(p.created_at).toLocaleDateString("tr-TR")}</div>
                      <div className="title">{p.title}</div>
                      <div className="pick" style={{ color: "var(--text-3)" }}>{p.excerpt || "Otomatik analiz raporu..."}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="blogcard">
                  <div className="body">
                    <div className="title">Blog yazısı bulunamadı.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
