export interface BasketSimilarMatch {
  id: string;
  matchDate?: string;
  saat?: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  ftScore: string;
  htScore: string;
  periodScores: string;
  oran_1: string;
  oran_2: string;
  handikap_limit: string;
  oran_h1: string;
  oran_h2: string;
  toplam_limit: string;
  oran_alt: string;
  oran_ust: string;
  score?: number; // Benzerlik skoru
  isTargetMatch?: boolean;
}

export interface BasketMatchData {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  oran_1: string;
  oran_2: string;
  handikap_limit: string;
  oran_h1: string;
  oran_h2: string;
  toplam_limit: string;
  oran_alt: string;
  oran_ust: string;
  similarMatches: BasketSimilarMatch[];
}

export function createEmptyBasketSimilarMatch(id: string): BasketSimilarMatch {
  return {
    id,
    homeTeam: '',
    awayTeam: '',
    ftScore: '',
    htScore: '',
    periodScores: '',
    oran_1: '',
    oran_2: '',
    handikap_limit: '',
    oran_h1: '',
    oran_h2: '',
    toplam_limit: '',
    oran_alt: '',
    oran_ust: '',
  };
}
