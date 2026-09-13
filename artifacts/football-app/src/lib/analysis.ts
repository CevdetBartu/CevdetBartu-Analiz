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
  altOdds35?: string;
  ustOdds35?: string;
  iyAltOdds15?: string;
  iyUstOdds15?: string;
  iyAltOdds05?: string;
  iyUstOdds05?: string;
  avgOddsMin: string;
  avgOddsMax: string;
  imResult: string;
  kornerHome: string;
  kornerAway: string;
  isTargetMatch?: boolean;
  matchDate?: string;
  league?: string;
  similarityScore?: number | string;
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
    altOdds35: '',
    ustOdds35: '',
    iyAltOdds15: '',
    iyUstOdds15: '',
    iyAltOdds05: '',
    iyUstOdds05: '',
    avgOddsMin: '',
    avgOddsMax: '',
    imResult: '',
    kornerHome: '',
    kornerAway: '',
  };
}
