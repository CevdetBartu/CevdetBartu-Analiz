import { AnalyzeMatchesBody } from './lib/api-zod/src/generated/api';

const payload = {
  targetMatch: {
    homeTeam: "A",
    awayTeam: "B",
    league: "TargetLeague"
  },
  referenceMatches: [
    {
      id: "1",
      homeTeam: "C",
      awayTeam: "D",
      league: "RefLeague",
      ftScore: "1:1",
      createdAt: "now"
    }
  ]
};

const parsed = AnalyzeMatchesBody.safeParse(payload);
console.log(JSON.stringify(parsed, null, 2));
