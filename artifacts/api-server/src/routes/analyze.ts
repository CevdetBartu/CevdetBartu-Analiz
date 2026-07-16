import { Router, type IRouter } from "express";
import { AnalyzeMatchesBody } from "@workspace/api-zod";
import { analyze } from "../lib/analyzeEngine";

const router: IRouter = Router();

router.post("/analyze", (req, res): void => {
  const parsed = AnalyzeMatchesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetMatch, referenceMatches } = parsed.data;

  const result = analyze(
    {
      date:          targetMatch.date          ?? null,
      time:          targetMatch.time          ?? null,
      league:        targetMatch.league        ?? null,
      homeTeam:      targetMatch.homeTeam,
      awayTeam:      targetMatch.awayTeam,
      ligSirasiHome: targetMatch.ligSirasiHome ?? null,
      ligSirasiAway: targetMatch.ligSirasiAway ?? null,
      ligSirasiTotal:targetMatch.ligSirasiTotal ?? null,
      oddsHome:      targetMatch.oddsHome      ?? null,
      oddsDraw:      targetMatch.oddsDraw      ?? null,
      oddsAway:      targetMatch.oddsAway      ?? null,
      altOdds:       targetMatch.altOdds       ?? null,
      ustOdds:       targetMatch.ustOdds       ?? null,
      varOdds:       targetMatch.varOdds       ?? null,
      yokOdds:       targetMatch.yokOdds       ?? null,
      avgOddsMin:    targetMatch.avgOddsMin    ?? null,
      avgOddsMax:    targetMatch.avgOddsMax    ?? null,
    },
    referenceMatches.map(m => ({
      id:              m.id              ?? null,
      homeTeam:        m.homeTeam,
      awayTeam:        m.awayTeam,
      htScore:         m.htScore         ?? null,
      ftScore:         m.ftScore,
      previousScore:   m.previousScore   ?? null,
      yellowCardsHome: m.yellowCardsHome ?? null,
      yellowCardsAway: m.yellowCardsAway ?? null,
      redCards:        m.redCards        ?? null,
      ligSirasiHome:   m.ligSirasiHome   ?? null,
      ligSirasiAway:   m.ligSirasiAway   ?? null,
      ligSirasiTotal:  m.ligSirasiTotal  ?? null,
      oddsHome:        m.oddsHome        ?? null,
      oddsDraw:        m.oddsDraw        ?? null,
      oddsAway:        m.oddsAway        ?? null,
      altOdds:         m.altOdds         ?? null,
      ustOdds:         m.ustOdds         ?? null,
      varOdds:         m.varOdds         ?? null,
      yokOdds:         m.yokOdds         ?? null,
      avgOddsMin:      m.avgOddsMin      ?? null,
      avgOddsMax:      m.avgOddsMax      ?? null,
      imResult:        m.imResult        ?? null,
      kornerHome:      m.kornerHome      ?? null,
      kornerAway:      m.kornerAway      ?? null,
    }))
  );

  res.json(result);
});

export default router;
