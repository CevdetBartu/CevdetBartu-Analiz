import { Router, type IRouter } from "express";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { queryScraperMatches } from "../lib/scraperDb";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router: IRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../../database/gecmis_maclar.db");

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

function parseScore(s: string | null | undefined): { home: number; away: number } | null {
  if (!s) return null;
  const m = s.trim().replace(/\s/g, '').match(/^(\d+)[:\-](\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1], 10), away: parseInt(m[2], 10) };
}

router.get("/dogrulama/predictions", async (req, res): Promise<void> => {
  try {
    const db = getDb();
    const now = new Date();
    
    // YYYY-MM-DD
    const formatISO = (d: Date) => d.toISOString().slice(0, 10);
    // DD.MM.YYYY
    const formatDot = (iso: string) => {
      const [y, m, d] = iso.split("-");
      return `${d}.${m}.${y}`;
    };

    const dates: string[] = [];
    // Son 1 gün (bitmiş olanları doğrulamak için) + bugün + sonraki 2 gün (toplam 4 günlük pencere)
    for (let i = -1; i <= 2; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const iso = formatISO(d);
      dates.push(iso);
      dates.push(formatDot(iso));
    }

    const placeholders = dates.map(() => "?").join(",");
    const stmt = db.prepare(`
      SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, devre_skoru,
             oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok,
             kart_ev, kart_dep, kirmizi_kart, lig_sira_ev, lig_sira_dep, toplam_takim
      FROM gecmis_maclar
      WHERE tarih IN (${placeholders})
      ORDER BY tarih ASC, saat ASC
    `);
    
    const rows = stmt.all(...dates) as any[];

    const predictions: any[] = [];
    let bttsTotal = 0;
    let bttsWon = 0;
    let overTotal = 0;
    let overWon = 0;
    let msTotal = 0;
    let msWon = 0;

    let bttsTotalV1 = 0;
    let bttsWonV1 = 0;
    let overTotalV1 = 0;
    let overWonV1 = 0;
    let msTotalV1 = 0;
    let msWonV1 = 0;

    for (const row of rows) {
      const o1 = row.oran_1;
      const ox = row.oran_x;
      const o2 = row.oran_2;

      // Oranları olmayan veya tamamlanmamış (oran bazlı) maçları atla
      if (!o1 || !ox || !o2) continue;

      // 1. Benzer aday maçları çek (±0.35 oran aralığı)
      let candidates: any[] = [];
      try {
        candidates = queryScraperMatches(o1, ox, o2, "CLOSING");
      } catch (err) {
        continue;
      }

      // Mevcut maçı aday havuzundan çıkar
      const filteredCandidates = candidates.filter((c: any) => c.id !== row.id);
      if (filteredCandidates.length === 0) continue;

      // Model V1 (Eski Matematiksel Hesaplama) Simülasyonu
      const scoreV1 = parseScore(row.mac_skoru);
      const isFinishedV1 = scoreV1 !== null;
      const homeGoalsV1 = scoreV1 ? scoreV1.home : 0;
      const awayGoalsV1 = scoreV1 ? scoreV1.away : 0;

      const refMatchesV1 = filteredCandidates.filter((c: any) => {
        const cAlt = c.altOdds ? parseFloat(c.altOdds) : null;
        const cUst = c.ustOdds ? parseFloat(c.ustOdds) : null;
        const cVar = c.varOdds ? parseFloat(c.varOdds) : null;
        const cYok = c.yokOdds ? parseFloat(c.yokOdds) : null;

        const altDiff = row.alt_orani != null && cAlt != null ? Math.abs(row.alt_orani - cAlt) : 999;
        const ustDiff = row.ust_orani != null && cUst != null ? Math.abs(row.ust_orani - cUst) : 999;
        const varDiff = row.kg_var != null && cVar != null ? Math.abs(row.kg_var - cVar) : 999;
        const yokDiff = row.kg_yok != null && cYok != null ? Math.abs(row.kg_yok - cYok) : 999;
        return altDiff <= 0.10 && ustDiff <= 0.10 && varDiff <= 0.10 && yokDiff <= 0.10;
      });

      if (refMatchesV1.length > 0) {
        let v1BttsCount = 0;
        let v1OverCount = 0;
        let v1HomeCount = 0;
        let v1DrawCount = 0;
        let v1AwayCount = 0;

        refMatchesV1.forEach((m: any) => {
          const mScore = parseScore(m.ftScore);
          if (mScore) {
            if (mScore.home > 0 && mScore.away > 0) v1BttsCount++;
            if ((mScore.home + mScore.away) > 2.5) v1OverCount++;
            if (mScore.home > mScore.away) v1HomeCount++;
            else if (mScore.home === mScore.away) v1DrawCount++;
            else v1AwayCount++;
          }
        });

        const v1BttsPct = (v1BttsCount / refMatchesV1.length) * 100;
        const v1OverPct = (v1OverCount / refMatchesV1.length) * 100;
        const v1HomePct = (v1HomeCount / refMatchesV1.length) * 100;
        const v1DrawPct = (v1DrawCount / refMatchesV1.length) * 100;
        const v1AwayPct = (v1AwayCount / refMatchesV1.length) * 100;

        if (isFinishedV1) {
          if (v1BttsPct >= 80) {
            bttsTotalV1++;
            if (homeGoalsV1 > 0 && awayGoalsV1 > 0) bttsWonV1++;
          }
          if (v1OverPct >= 80) {
            overTotalV1++;
            if ((homeGoalsV1 + awayGoalsV1) > 2.5) overWonV1++;
          }
          if (v1HomePct >= 60) {
            msTotalV1++;
            if (homeGoalsV1 > awayGoalsV1) msWonV1++;
          }
          if (v1AwayPct >= 60) {
            msTotalV1++;
            if (awayGoalsV1 > homeGoalsV1) msWonV1++;
          }
        }
      }

      // 2. Benzerlik hesapla ve filtrele
      const ligDiff = (row.lig_sira_ev != null && row.lig_sira_dep != null)
        ? Math.abs(row.lig_sira_ev - row.lig_sira_dep)
        : null;

      const avgCards = (row.kart_ev != null && row.kart_dep != null)
        ? row.kart_ev + row.kart_dep + (row.kirmizi_kart ?? 0)
        : null;

      const query = {
        oddsHome: o1,
        oddsDraw: ox,
        oddsAway: o2,
        altOdds: row.alt_orani,
        ustOdds: row.ust_orani,
        varOdds: row.kg_var,
        yokOdds: row.kg_yok,
        league: row.lig,
        ligSirasiDiff: ligDiff,
        avgCardsTotal: avgCards,
        maxResults: 5
      };

      const similarResults = findSimilarMatches(query, filteredCandidates);
      if (similarResults.length < 3) continue; // Yeterli benzer maç yoksa geç

      // 3. Analiz motorunu çalıştır
      const refMatches = similarResults.map((r) => ({
        id: r.match.id?.toString(),
        homeTeam: r.match.homeTeam,
        awayTeam: r.match.awayTeam,
        htScore: r.match.htScore,
        ftScore: r.match.ftScore,
        previousScore: r.match.previousScore,
        yellowCardsHome: r.match.yellowCardsHome,
        yellowCardsAway: r.match.yellowCardsAway,
        redCards: r.match.redCards,
        ligSirasiHome: r.match.ligSirasiHome,
        ligSirasiAway: r.match.ligSirasiAway,
        ligSirasiTotal: r.match.ligSirasiTotal,
        oddsHome: r.match.oddsHome ? parseFloat(r.match.oddsHome) : undefined,
        oddsDraw: r.match.oddsDraw ? parseFloat(r.match.oddsDraw) : undefined,
        oddsAway: r.match.oddsAway ? parseFloat(r.match.oddsAway) : undefined,
        altOdds: r.match.altOdds ? parseFloat(r.match.altOdds) : undefined,
        ustOdds: r.match.ustOdds ? parseFloat(r.match.ustOdds) : undefined,
        varOdds: r.match.varOdds ? parseFloat(r.match.varOdds) : undefined,
        yokOdds: r.match.yokOdds ? parseFloat(r.match.yokOdds) : undefined,
        avgOddsMin: r.match.avgOddsMin ? parseFloat(r.match.avgOddsMin) : undefined,
        avgOddsMax: r.match.avgOddsMax ? parseFloat(r.match.avgOddsMax) : undefined,
        imResult: r.match.imResult,
        kornerHome: r.match.kornerHome,
        kornerAway: r.match.kornerAway,
        similarityScore: r.similarityScore
      }));

      const analysis = analyze(
        {
          date: row.tarih,
          time: row.saat,
          league: row.lig,
          homeTeam: row.ev_sahibi,
          awayTeam: row.deplasman,
          oddsHome: o1,
          oddsDraw: ox,
          oddsAway: o2,
          altOdds: row.alt_orani,
          ustOdds: row.ust_orani,
          varOdds: row.kg_var,
          yokOdds: row.kg_yok
        },
        refMatches
      );

      const bttsPct = analysis.analiz_ozet.kg_var.yuzde;
      const overPct = analysis.analiz_ozet.ust_25.yuzde;
      const homePct = analysis.analiz_ozet.ev_sahibi.yuzde;
      const drawPct = analysis.analiz_ozet.beraberlik.yuzde;
      const awayPct = analysis.analiz_ozet.deplasman.yuzde;

      const confidence = analysis.analiz_ozet.guven_seviyesi ?? "DUSUK";
      const confidenceScore = analysis.analiz_ozet.guvenlik_skoru ?? 0;

      // Sadece DÜŞÜK olmayan güven seviyelerini tahmin olarak ekle
      if (confidence === "DUSUK") continue;

      // Skor kontrolü
      const score = parseScore(row.mac_skoru);
      const isFinished = score !== null;
      const homeGoals = score ? score.home : 0;
      const awayGoals = score ? score.away : 0;

      // KG VAR tahmini (>= 80%)
      if (bttsPct >= 80) {
        let status = "PENDING";
        if (isFinished) {
          const won = homeGoals > 0 && awayGoals > 0;
          status = won ? "WON" : "LOST";
          bttsTotal++;
          if (won) bttsWon++;
        }
        predictions.push({
          id: `${row.id}-kg`,
          tarih: row.tarih,
          saat: row.saat,
          lig: row.lig,
          ev_sahibi: row.ev_sahibi,
          deplasman: row.deplasman,
          tahmin: "KG VAR",
          olasilik: bttsPct,
          guvenlik: confidence,
          guvenlik_skoru: confidenceScore,
          skor: row.mac_skoru || "-:-",
          durum: status
        });
      }

      // 2.5 ÜST tahmini (>= 80%)
      if (overPct >= 80) {
        let status = "PENDING";
        if (isFinished) {
          const won = (homeGoals + awayGoals) > 2.5;
          status = won ? "WON" : "LOST";
          overTotal++;
          if (won) overWon++;
        }
        predictions.push({
          id: `${row.id}-over`,
          tarih: row.tarih,
          saat: row.saat,
          lig: row.lig,
          ev_sahibi: row.ev_sahibi,
          deplasman: row.deplasman,
          tahmin: "2.5 ÜST",
          olasilik: overPct,
          guvenlik: confidence,
          guvenlik_skoru: confidenceScore,
          skor: row.mac_skoru || "-:-",
          durum: status
        });
      }

      // MS 1 tahmini (>= 60%)
      if (homePct >= 60) {
        let status = "PENDING";
        if (isFinished) {
          const won = homeGoals > awayGoals;
          status = won ? "WON" : "LOST";
          msTotal++;
          if (won) msWon++;
        }
        predictions.push({
          id: `${row.id}-ms1`,
          tarih: row.tarih,
          saat: row.saat,
          lig: row.lig,
          ev_sahibi: row.ev_sahibi,
          deplasman: row.deplasman,
          tahmin: "MS 1",
          olasilik: homePct,
          guvenlik: confidence,
          guvenlik_skoru: confidenceScore,
          skor: row.mac_skoru || "-:-",
          durum: status
        });
      }

      // MS 2 tahmini (>= 60%)
      if (awayPct >= 60) {
        let status = "PENDING";
        if (isFinished) {
          const won = awayGoals > homeGoals;
          status = won ? "WON" : "LOST";
          msTotal++;
          if (won) msWon++;
        }
        predictions.push({
          id: `${row.id}-ms2`,
          tarih: row.tarih,
          saat: row.saat,
          lig: row.lig,
          ev_sahibi: row.ev_sahibi,
          deplasman: row.deplasman,
          tahmin: "MS 2",
          olasilik: awayPct,
          guvenlik: confidence,
          guvenlik_skoru: confidenceScore,
          skor: row.mac_skoru || "-:-",
          durum: status
        });
      }

      }

    res.json({
      ok: true,
      stats: {
        btts: {
          total: bttsTotal,
          won: bttsWon,
          rate: bttsTotal > 0 ? parseFloat((bttsWon / bttsTotal * 100).toFixed(2)) : 0
        },
        over: {
          total: overTotal,
          won: overWon,
          rate: overTotal > 0 ? parseFloat((overWon / overTotal * 100).toFixed(2)) : 0
        },
        ms: {
          total: msTotal,
          won: msWon,
          rate: msTotal > 0 ? parseFloat((msWon / msTotal * 100).toFixed(2)) : 0
        },
        overall: {
          total: bttsTotal + overTotal + msTotal,
          won: bttsWon + overWon + msWon,
          rate: (bttsTotal + overTotal + msTotal) > 0 ? parseFloat(((bttsWon + overWon + msWon) / (bttsTotal + overTotal + msTotal) * 100).toFixed(2)) : 0
        }
      },
      statsV1: {
        btts: {
          total: bttsTotalV1,
          won: bttsWonV1,
          rate: bttsTotalV1 > 0 ? parseFloat((bttsWonV1 / bttsTotalV1 * 100).toFixed(2)) : 0
        },
        over: {
          total: overTotalV1,
          won: overWonV1,
          rate: overTotalV1 > 0 ? parseFloat((overWonV1 / overTotalV1 * 100).toFixed(2)) : 0
        },
        ms: {
          total: msTotalV1,
          won: msWonV1,
          rate: msTotalV1 > 0 ? parseFloat((msWonV1 / msTotalV1 * 100).toFixed(2)) : 0
        },
        overall: {
          total: bttsTotalV1 + overTotalV1 + msTotalV1,
          won: bttsWonV1 + overWonV1 + msWonV1,
          rate: (bttsTotalV1 + overTotalV1 + msTotalV1) > 0 ? parseFloat(((bttsWonV1 + overWonV1 + msWonV1) / (bttsTotalV1 + overTotalV1 + msTotalV1) * 100).toFixed(2)) : 0
        }
      },
      predictions
    });

  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message ?? "Bilinmeyen sunucu hatası" });
  }
});

export default router;
