import React from 'react';
import type { BasketAnalysisResult } from '../../../api-server/src/lib/basketAnalyzeEngine';

interface BasketAnalysisTableProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  analyzeResponse: BasketAnalysisResult;
}

export function BasketAnalysisTable({
  date,
  time,
  league,
  homeTeam,
  awayTeam,
  analyzeResponse,
}: BasketAnalysisTableProps) {
  const { analiz_ozet, istatistikler } = analyzeResponse;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── HEDEF MAÇ PANELSİ ────────────────────────────────────────── */}
      <div className="analysis-summary-card" style={{ borderLeft: '4px solid #f59e0b' }}>
        <div className="summary-main-grid">
          <div>
            <span className="summary-meta-label">Tarih / Saat / Lig</span>
            <div className="summary-meta-val">{date} {time} — {league || 'Bilinmeyen Lig'}</div>
            <div className="summary-teams-wrap" style={{ marginTop: 8 }}>
              <span className="summary-team home" style={{ color: '#f59e0b' }}>{homeTeam}</span>
              <span className="summary-vs">vs</span>
              <span className="summary-team away" style={{ color: '#3b82f6' }}>{awayTeam}</span>
            </div>
          </div>

          {/* İstatistikler */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="summary-stat-box">
              <span className="stat-box-title">Maç Sonucu Kazanma</span>
              <div className="stat-box-num" style={{ color: '#28c828' }}>%{analiz_ozet.ev_sahibi.kazanma} / %{analiz_ozet.deplasman.kazanma}</div>
              <span className="stat-box-sub">Ev / Deplasman ({analiz_ozet.ev_sahibi.adet} - {analiz_ozet.deplasman.adet} Maç)</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-box-title">Handikap ({analiz_ozet.handikap.limit})</span>
              <div className="stat-box-num" style={{ color: '#f59e0b' }}>%{analiz_ozet.handikap.ev_kapadi} / %{analiz_ozet.handikap.dep_kapadi}</div>
              <span className="stat-box-sub">Ev Kapadı / Dep Kapadı ({analiz_ozet.handikap.ev_adet} - {analiz_ozet.handikap.dep_adet} Maç)</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-box-title">Toplam Sayı ({analiz_ozet.toplam_sayi.limit})</span>
              <div className="stat-box-num" style={{ color: '#3b82f6' }}>%{analiz_ozet.toplam_sayi.ust_yuzde} Üst / %{analiz_ozet.toplam_sayi.alt_yuzde} Alt</div>
              <span className="stat-box-sub">{analiz_ozet.toplam_sayi.ust_adet} Üst - {analiz_ozet.toplam_sayi.alt_adet} Alt Maç</span>
            </div>
          </div>
        </div>

        {/* Ortalamalar ve Ekstra İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20, borderTop: '1px solid #1e293b', paddingTop: 16 }}>
          <div>
            <span className="summary-meta-label">Sayı Ortalamaları (Toplam / IY)</span>
            <div style={{ fontSize: '0.9rem', color: '#aec6e8', marginTop: 4 }}>
              • Ev Sahibi: <strong style={{ color: '#fff' }}>{analiz_ozet.ortalamalar.ev_sayi}</strong> sayı (IY: {analiz_ozet.ortalamalar.iy_ev_sayi})<br />
              • Deplasman: <strong style={{ color: '#fff' }}>{analiz_ozet.ortalamalar.dep_sayi}</strong> sayı (IY: {analiz_ozet.ortalamalar.iy_dep_sayi})<br />
              • Toplam Maç: <strong style={{ color: '#fff' }}>{analiz_ozet.ortalamalar.toplam_sayi}</strong> sayı (IY: {analiz_ozet.ortalamalar.iy_toplam_sayi})
            </div>
          </div>

          <div>
            <span className="summary-meta-label">Barem Dağılımları (Toplam Sayı Üst Yüzdeleri)</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
              <div style={{ fontSize: '0.82rem' }}>150.5 Üst: <strong>%{istatistikler.ust_150_5}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>155.5 Üst: <strong>%{istatistikler.ust_155_5}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>160.5 Üst: <strong>%{istatistikler.ust_160_5}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>165.5 Üst: <strong>%{istatistikler.ust_165_5}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>170.5 Üst: <strong>%{istatistikler.ust_170_5}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>175.5 Üst: <strong>%{istatistikler.ust_175_5}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', textAlign: 'right' }}>
        * Analiz toplam {analiz_ozet.mac_sayisi} benzer geçmiş basketbol karşılaşması üzerinden hesaplanmıştır.
      </div>
    </div>
  );
}
