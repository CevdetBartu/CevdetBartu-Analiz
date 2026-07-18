export interface SimilarMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  htScore: string;
  ftScore: string;
  previousScore: string;
  yellowCardsHome: string;
  yellowCardsAway: string;
  redCards: string;
  ligSirasiHome: string;
  ligSirasiAway: string;
  ligSirasiTotal: string;
  oddsHome: string;
  oddsDraw: string;
  oddsAway: string;
  altOdds: string;
  ustOdds: string;
  varOdds: string;
  yokOdds: string;
  avgOddsMin: string;
  avgOddsMax: string;
  imResult: string;
  kornerHome: string;
  kornerAway: string;
  isTargetMatch?: boolean;
  matchDate?: string;
  league?: string;
}

export interface MatchData {
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  similarMatches: SimilarMatch[];
}

export function createEmptySimilarMatch(id: string): SimilarMatch {
  return {
    id,
    homeTeam: '',
    awayTeam: '',
    htScore: '',
    ftScore: '',
    previousScore: '',
    yellowCardsHome: '',
    yellowCardsAway: '',
    redCards: '0',
    ligSirasiHome: '',
    ligSirasiAway: '',
    ligSirasiTotal: '20',
    oddsHome: '',
    oddsDraw: '',
    oddsAway: '',
    altOdds: '',
    ustOdds: '',
    varOdds: '',
    yokOdds: '',
    avgOddsMin: '',
    avgOddsMax: '',
    imResult: '',
    kornerHome: '',
    kornerAway: '',
  };
}
