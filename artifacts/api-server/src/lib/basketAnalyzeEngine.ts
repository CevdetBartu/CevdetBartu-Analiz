import type { BasketHistoricalMatch } from "./basketScraperDb";

export interface BasketAnalysisResult {
  analiz_ozet: {
    mac_sayisi: number;
    ev_sahibi: {
      kazanma: number; // Yüzde
      adet: number;
    };
    deplasman: {
      kazanma: number; // Yüzde
      adet: number;
    };
    handikap: {
      ev_kapadi: number; // Yüzde
      ev_adet: number;
      dep_kapadi: number; // Yüzde
      dep_adet: number;
      limit: number;
    };
    toplam_sayi: {
      ust_yuzde: number;
      ust_adet: number;
      alt_yuzde: number;
      alt_adet: number;
      limit: number;
    };
    ortalamalar: {
      ev_sayi: number;
      dep_sayi: number;
      toplam_sayi: number;
      iy_ev_sayi: number;
      iy_dep_sayi: number;
      iy_toplam_sayi: number;
    };
  };
  istatistikler: {
    ust_150_5: number;
    ust_155_5: number;
    ust_160_5: number;
    ust_165_5: number;
    ust_170_5: number;
    ust_175_5: number;
  };
}

export function analyzeBasketMatches(
  target: {
    handikap_limit?: number | null;
    toplam_limit?: number | null;
  },
  referenceMatches: BasketHistoricalMatch[]
): BasketAnalysisResult {
  const completed = referenceMatches.filter(
    (m) => m.ftScore && m.ftScore !== "?:?" && m.ftScore.includes(":")
  );

  const totalCount = completed.length;

  let homeWins = 0;
  let awayWins = 0;

  // Handikap
  const hLimit = target.handikap_limit ?? 0;
  let homeHandicapCovers = 0;
  let awayHandicapCovers = 0;

  // Toplam Sayı
  const tLimit = target.toplam_limit ?? 160.5;
  let overCount = 0;
  let underCount = 0;

  // Ortalamalar
  let totalHomePoints = 0;
  let totalAwayPoints = 0;
  let totalHalfHomePoints = 0;
  let totalHalfAwayPoints = 0;
  let halfTimeCount = 0;

  // Çeşitli Limit Dağılımları
  let u150 = 0;
  let u155 = 0;
  let u160 = 0;
  let u165 = 0;
  let u170 = 0;
  let u175 = 0;

  for (const m of completed) {
    const [hStr, aStr] = m.ftScore.split(":");
    const h = parseInt(hStr, 10);
    const a = parseInt(aStr, 10);
    if (isNaN(h) || isNaN(a)) continue;

    // 1. Galibiyet
    if (h > a) homeWins++;
    else awayWins++;

    // 2. Handikap kapama: (HomeScore - AwayScore) + handikap_limit > 0 ise Ev kapamıştır
    const margin = h - a;
    if (margin + hLimit > 0) {
      homeHandicapCovers++;
    } else if (margin + hLimit < 0) {
      awayHandicapCovers++;
    }

    // 3. Toplam Sayı Alt/Üst
    const totalPts = h + a;
    if (totalPts > tLimit) overCount++;
    else if (totalPts < tLimit) underCount++;

    // Ortalamalar
    totalHomePoints += h;
    totalAwayPoints += a;

    if (m.htScore && m.htScore.includes(":")) {
      const [hHtStr, aHtStr] = m.htScore.split(":");
      const hh = parseInt(hHtStr, 10);
      const ha = parseInt(aHtStr, 10);
      if (!isNaN(hh) && !isNaN(ha)) {
        totalHalfHomePoints += hh;
        totalHalfAwayPoints += ha;
        halfTimeCount++;
      }
    }

    // Baremler
    if (totalPts > 150.5) u150++;
    if (totalPts > 155.5) u155++;
    if (totalPts > 160.5) u160++;
    if (totalPts > 165.5) u165++;
    if (totalPts > 170.5) u170++;
    if (totalPts > 175.5) u175++;
  }

  const pct = (val: number) => (totalCount > 0 ? Math.round((val / totalCount) * 100) : 0);

  return {
    analiz_ozet: {
      mac_sayisi: totalCount,
      ev_sahibi: {
        kazanma: pct(homeWins),
        adet: homeWins,
      },
      deplasman: {
        kazanma: pct(awayWins),
        adet: awayWins,
      },
      handikap: {
        ev_kapadi: pct(homeHandicapCovers),
        ev_adet: homeHandicapCovers,
        dep_kapadi: pct(awayHandicapCovers),
        dep_adet: awayHandicapCovers,
        limit: hLimit,
      },
      toplam_sayi: {
        ust_yuzde: pct(overCount),
        ust_adet: overCount,
        alt_yuzde: pct(underCount),
        alt_adet: underCount,
        limit: tLimit,
      },
      ortalamalar: {
        ev_sayi: totalCount > 0 ? round(totalHomePoints / totalCount, 1) : 0,
        dep_sayi: totalCount > 0 ? round(totalAwayPoints / totalCount, 1) : 0,
        toplam_sayi: totalCount > 0 ? round((totalHomePoints + totalAwayPoints) / totalCount, 1) : 0,
        iy_ev_sayi: halfTimeCount > 0 ? round(totalHalfHomePoints / halfTimeCount, 1) : 0,
        iy_dep_sayi: halfTimeCount > 0 ? round(totalHalfAwayPoints / halfTimeCount, 1) : 0,
        iy_toplam_sayi: halfTimeCount > 0 ? round((totalHalfHomePoints + totalHalfAwayPoints) / halfTimeCount, 1) : 0,
      },
    },
    istatistikler: {
      ust_150_5: pct(u150),
      ust_155_5: pct(u155),
      ust_160_5: pct(u160),
      ust_165_5: pct(u165),
      ust_170_5: pct(u170),
      ust_175_5: pct(u175),
    },
  };
}

function round(val: number, decimals: number): number {
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
}
