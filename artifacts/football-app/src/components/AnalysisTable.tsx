import React from 'react';
import type { AnalyzeResponse, TabloSatiri } from '@workspace/api-client-react';

interface AnalysisTableProps {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  analyzeResponse: AnalyzeResponse;
}

function StatPill({ label, color }: { label: string; color: string }) {
  return <span className="stat-pill" style={{ color }}>{label}</span>;
}

function pctColor(pct: number) {
  if (pct >= 70) return '#28c828';
  if (pct >= 40) return '#e6c62a';
  return '#e87070';
}

function OddsCell({ value, isWinner, isLoser }: { value: string | null | undefined; isWinner: boolean; isLoser: boolean }) {
  if (!value) return null;
  const cls = isWinner ? 'odds-win' : isLoser ? 'odds-lose' : '';
  return <span className={cls}>{value}</span>;
}

export function AnalysisTable({ date, time, league, homeTeam, awayTeam, analyzeResponse }: AnalysisTableProps) {
  const { analiz_ozet: ozet, tahminler, tablo_satirlari } = analyzeResponse;
  const hasData = ozet.total_mac > 0;

  return (
    <div className="analysis-card">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="analysis-header">
        <div className="analysis-header-left">
          <div className="match-datetime">{date}{time ? ` - ${time}` : ''}</div>
          <div className="match-league">{league}</div>
          <div className="match-teams">
            <span className="team-link">{homeTeam}</span>
            <span className="team-separator"> - </span>
            <span className="team-link">{awayTeam}</span>
          </div>
        </div>

        <div className="analysis-watermark">Analyzed by CevdetBartu</div>

        <div className="analysis-predictions">
          {tahminler.map((pred, i) => (
            <div key={i} className="prediction-item">{pred}</div>
          ))}
        </div>
      </div>

      {/* ── Stats Summary Bar ──────────────────────────────────────────────── */}
      {hasData && (
        <div className="stats-bar">
          <span className="stats-bar-label">{ozet.total_mac} referans maç:</span>
          <StatPill label={ozet.ev_sahibi.label}  color={pctColor(ozet.ev_sahibi.yuzde)}  />
          <span className="stats-sep">|</span>
          <StatPill label={ozet.beraberlik.label} color={pctColor(ozet.beraberlik.yuzde)} />
          <span className="stats-sep">|</span>
          <StatPill label={ozet.deplasman.label}  color={pctColor(ozet.deplasman.yuzde)}  />
          <span className="stats-sep">·</span>
          <StatPill label={ozet.kg_var.label}  color={pctColor(ozet.kg_var.yuzde)}  />
          <span className="stats-sep">·</span>
          <StatPill label={ozet.ust_25.label}  color={pctColor(ozet.ust_25.yuzde)}  />
          <span className="stats-sep">·</span>
          <span className="stat-pill" style={{ color: ozet.ort_kart >= 4.5 ? '#e87070' : '#5dc85d' }}>
            Ort. Kart: <strong>{ozet.ort_kart.toFixed(1)}</strong>
          </span>
          {ozet.ort_korner != null && (
            <>
              <span className="stats-sep">·</span>
              <span className="stat-pill" style={{ color: ozet.ort_korner >= 10 ? '#e87070' : '#5dc85d' }}>
                Ort. Korner: <strong>{ozet.ort_korner.toFixed(1)}</strong>
              </span>
              <span className="stats-sep">|</span>
              <StatPill label={ozet.ust_10_korner.label} color={pctColor(ozet.ust_10_korner.yuzde)} />
            </>
          )}
          {ozet.sik_ms && (
            <>
              <span className="stats-sep">·</span>
              <span className="stat-pill" style={{ color: '#a8c4e0' }}>Sık MS: <strong>{ozet.sik_ms}</strong></span>
            </>
          )}
          {ozet.sik_iy && (
            <>
              <span className="stats-sep">·</span>
              <span className="stat-pill" style={{ color: '#a8c4e0' }}>Sık İY: <strong>{ozet.sik_iy}</strong></span>
            </>
          )}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="table-wrapper">
        <table className="analysis-table">
          <thead>
            <tr>
              <th className="th-analiz">Analiz %</th>
              <th className="th-ht col-highlight">Devre</th>
              <th className="th-ft">MSkor</th>
              <th className="th-teams">Benzer Karşılaşmalar</th>
              <th className="th-prev">Önceki</th>
              <th className="th-flag">🚩</th>
              <th className="th-cards col-highlight">Card</th>
              <th className="th-lig">Lig Sırası</th>
              <th className="th-odds">Taraf Oranları</th>
              <th className="th-altust col-highlight">Alt / Üst</th>
              <th className="th-varyok col-highlight">Var / Yok</th>
              <th className="th-avg">Ortalama</th>
              <th className="th-korner col-highlight">Korner</th>
              <th className="th-im">i/m</th>
            </tr>
          </thead>
          <tbody>
            {tablo_satirlari.map((satir: TabloSatiri) => {
              const { taraf_oranlari: t, alt_ust: au, var_yok: vy } = satir;

              return (
                <tr key={satir.id} className={satir.row_renk}>
                  {/* Analiz % */}
                  <td className="td-analiz">
                    {!satir.is_target && <span className="analiz-badge">{satir.analiz_yuzde}</span>}
                  </td>

                  {/* İY Devre */}
                  <td className={`td-score col-highlight${satir.iy_skor_renk ? ` ${satir.iy_skor_renk}` : ''}${satir.iy_skor_sik_mi ? ' score-mostcommon' : ''}`}>
                    {satir.is_target
                      ? (satir.iy_tahmini ? <span className="score-hint">{satir.iy_tahmini}?</span> : '')
                      : (satir.iy_skor ?? '')}
                  </td>

                  {/* MS */}
                  <td className={`td-score${satir.ms_skor_renk ? ` ${satir.ms_skor_renk}` : ''}${satir.ms_skor_sik_mi ? ' score-mostcommon' : ''}`}>
                    {satir.is_target
                      ? (satir.ms_tahmini ? <span className="score-hint">{satir.ms_tahmini}?</span> : '')
                      : (satir.ms_skor ?? '')}
                  </td>

                  {/* Teams */}
                  <td className="td-teams">
                    {satir.is_target
                      ? <span className="team-highlight">{satir.takimlar}</span>
                      : <span>{satir.takimlar}</span>}
                  </td>

                  {/* Önceki */}
                  <td className="td-prev">{satir.onceki_skor ?? ''}</td>

                  {/* Flag */}
                  <td className="td-flag">
                    {satir.kirmizi_kart_var_mi ? <span className="flag-red">●</span> : ''}
                  </td>

                  {/* Cards */}
                  <td className={`td-cards col-highlight${satir.kart_yuksek_mi ? ' cards-high' : ''}`}>
                    {satir.kart_display ? <CardDisplay display={satir.kart_display} /> : ''}
                  </td>

                  {/* Lig Sırası */}
                  <td className="td-lig">{satir.lig_sirasi ?? ''}</td>

                  {/* Taraf Oranları */}
                  <td className="td-odds">
                    {(t?.ev || t?.ber || t?.dep) && (
                      <span>
                        <OddsCell value={t.ev}  isWinner={t.kazanan === 'ev'}  isLoser={!!t.kazanan && t.kazanan !== 'ev'}  />
                        {t.ev && '-'}
                        <OddsCell value={t.ber} isWinner={t.kazanan === 'ber'} isLoser={!!t.kazanan && t.kazanan !== 'ber'} />
                        {t.ber && '-'}
                        <OddsCell value={t.dep} isWinner={t.kazanan === 'dep'} isLoser={!!t.kazanan && t.kazanan !== 'dep'} />
                      </span>
                    )}
                  </td>

                  {/* Alt / Üst */}
                  <td className="td-altust col-highlight">
                    {(au?.alt || au?.ust) && (
                      <span>
                        <OddsCell value={au.alt} isWinner={au.kazanan === 'alt'} isLoser={!!au.kazanan && au.kazanan !== 'alt'} />
                        {au.alt && '-'}
                        <OddsCell value={au.ust} isWinner={au.kazanan === 'ust'} isLoser={!!au.kazanan && au.kazanan !== 'ust'} />
                      </span>
                    )}
                  </td>

                  {/* Var / Yok */}
                  <td className="td-varyok col-highlight">
                    {(vy?.var || vy?.yok) && (
                      <span>
                        <OddsCell value={vy.var} isWinner={vy.kazanan === 'var'} isLoser={!!vy.kazanan && vy.kazanan !== 'var'} />
                        {vy.var && '-'}
                        <OddsCell value={vy.yok} isWinner={vy.kazanan === 'yok'} isLoser={!!vy.kazanan && vy.kazanan !== 'yok'} />
                      </span>
                    )}
                  </td>

                  {/* Ortalama */}
                  <td className="td-avg">{satir.ortalama ?? ''}</td>

                  {/* Korner */}
                  <td className="td-korner col-highlight">{satir.korner_display ?? ''}</td>

                  {/* i/m */}
                  <td className={`td-im${satir.im_renk ? ` ${satir.im_renk}` : ''}`}>
                    {satir.im_sonuc ?? ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <div className="disclaimer-text">
        ANALİZ TABLOLARI SADECE İSTATİSTİKSEL VERİLERİ İÇERMEKTEDİR! YATIRIM VEYA BAHİS TAVSİYESİ DEĞİLDİR! SORUMLULUK SİZLERE AİTTİR...
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="analysis-footer">
        <button className="btn-subscriber">
          <span className="subscriber-icon">👤</span> Abonelerine Özel
        </button>
        <div className="footer-slogan">
          <em>İnsan şansını kendisi yaratır!</em>
        </div>
        <button className="btn-subscribe">
          <span className="subscribe-icon">⭐</span> Abone ol
        </button>
      </div>
    </div>
  );
}

function CardDisplay({ display }: { display: string }) {
  const parts = display.split(' - ');
  if (parts.length < 2) return <>{display}</>;
  const [yh, ya, red = '0'] = parts;
  const redNum = parseInt(red, 10) || 0;
  return (
    <>
      <span className="card-yellow">{yh}</span>
      {' - '}
      <span className="card-yellow">{ya}</span>
      {' - '}
      <span className={redNum > 0 ? 'card-red' : ''}>{red}</span>
    </>
  );
}
