import type { BasketHistoricalMatch } from "./basketScraperDb";

export interface BasketSimilarityResult {
  match: BasketHistoricalMatch;
  score: number; // 0 - 100
  isTargetMatch: boolean;
}

export function findSimilarBasketMatches(
  target: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    oran_1: number;
    oran_2: number;
    handikap_limit?: number | null;
    toplam_limit?: number | null;
  },
  candidates: BasketHistoricalMatch[]
): BasketSimilarityResult[] {
  const results: BasketSimilarityResult[] = [];

  for (const c of candidates) {
    // 1. Oran Mesafesi (Moneyline)
    const diff1 = Math.abs(target.oran_1 - (c.oran_1 ?? 0));
    const diff2 = Math.abs(target.oran_2 - (c.oran_2 ?? 0));
    const oddsDist = Math.sqrt(diff1 * diff1 + diff2 * diff2);
    
    // Skorlama: Fark sıfırsa 100, 1.0 farkta 0 puan
    let score = Math.max(0, 100 - (oddsDist / 1.0) * 100);

    // 2. Handikap Limit Uyuşumu
    if (target.handikap_limit != null && c.handikap_limit != null) {
      const hDiff = Math.abs(target.handikap_limit - c.handikap_limit);
      if (hDiff <= 1.5) {
        score += 8; // Yakın handikap bonusu
      } else if (hDiff > 5.0) {
        score -= 12; // Farklı handikap cezası
      }
    }

    // 3. Toplam Sayı Limit Uyuşumu
    if (target.toplam_limit != null && c.toplam_limit != null) {
      const tDiff = Math.abs(target.toplam_limit - c.toplam_limit);
      if (tDiff <= 3.0) {
        score += 8; // Yakın toplam limit bonusu
      } else if (tDiff > 12.0) {
        score -= 12; // Uzak toplam limit cezası
      }
    }

    // 4. Aynı Lig Bonusu
    if (
      target.league &&
      c.league &&
      target.league.trim().toLowerCase() === c.league.trim().toLowerCase()
    ) {
      score += 15;
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    // Kendisiyle eşleşmesini engelle
    if (
      c.homeTeam.toLowerCase() === target.homeTeam.toLowerCase() &&
      c.awayTeam.toLowerCase() === target.awayTeam.toLowerCase()
    ) {
      continue;
    }

    results.push({
      match: c,
      score: finalScore,
      isTargetMatch: false,
    });
  }

  // Benzerlik skoruna göre sırala
  return results.sort((a, b) => b.score - a.score);
}
