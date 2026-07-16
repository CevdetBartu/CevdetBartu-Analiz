import { Router, type IRouter } from "express";
import { db, historicalMatchesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateMatchBody,
  FindSimilarMatchesBody,
  DeleteMatchParams,
} from "@workspace/api-zod";
import { findSimilarMatches } from "../lib/similarity";
import { queryScraperMatches } from "../lib/scraperDb";

const router: IRouter = Router();

// GET /matches — list all
router.get("/matches", async (req, res): Promise<void> => {
  const matches = await db
    .select()
    .from(historicalMatchesTable)
    .orderBy(historicalMatchesTable.createdAt);
  res.json(matches);
});

// POST /matches — create
router.post("/matches", async (req, res): Promise<void> => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [match] = await db
    .insert(historicalMatchesTable)
    .values({
      ...parsed.data,
      oddsHome: String(parsed.data.oddsHome),
      oddsDraw: String(parsed.data.oddsDraw),
      oddsAway: String(parsed.data.oddsAway),
      altOdds: parsed.data.altOdds != null ? String(parsed.data.altOdds) : null,
      ustOdds: parsed.data.ustOdds != null ? String(parsed.data.ustOdds) : null,
      varOdds: parsed.data.varOdds != null ? String(parsed.data.varOdds) : null,
      yokOdds: parsed.data.yokOdds != null ? String(parsed.data.yokOdds) : null,
      avgOddsMin: parsed.data.avgOddsMin != null ? String(parsed.data.avgOddsMin) : null,
      avgOddsMax: parsed.data.avgOddsMax != null ? String(parsed.data.avgOddsMax) : null,
    })
    .returning();
  res.status(201).json(match);
});

// POST /matches/find-similar
router.post("/matches/find-similar", async (req, res): Promise<void> => {
  const parsed = FindSimilarMatchesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const pgMatches = await db.select().from(historicalMatchesTable);

  let scraperMatches: typeof pgMatches = [];
  try {
    scraperMatches = queryScraperMatches(
      parsed.data.oddsHome,
      parsed.data.oddsDraw,
      parsed.data.oddsAway
    );
  } catch (e: any) {
    // SQLite erişilemezse sessizce devam et
  }

  const allMatches = [...scraperMatches, ...pgMatches];

  const results = findSimilarMatches(
    {
      oddsHome: parsed.data.oddsHome,
      oddsDraw: parsed.data.oddsDraw,
      oddsAway: parsed.data.oddsAway,
      altOdds: parsed.data.altOdds ?? null,
      ustOdds: parsed.data.ustOdds ?? null,
      varOdds: parsed.data.varOdds ?? null,
      yokOdds: parsed.data.yokOdds ?? null,
      league: parsed.data.league ?? null,
      ligSirasiDiff: parsed.data.ligSirasiDiff ?? null,
      avgCardsTotal: parsed.data.avgCardsTotal ?? null,
      maxResults: parsed.data.maxResults ?? null,
    },
    allMatches
  );

  const serialized = results.map((r) => ({
    match: {
      ...r.match,
      oddsHome: parseFloat(r.match.oddsHome),
      oddsDraw: parseFloat(r.match.oddsDraw),
      oddsAway: parseFloat(r.match.oddsAway),
      altOdds: r.match.altOdds != null ? parseFloat(r.match.altOdds) : null,
      ustOdds: r.match.ustOdds != null ? parseFloat(r.match.ustOdds) : null,
      varOdds: r.match.varOdds != null ? parseFloat(r.match.varOdds) : null,
      yokOdds: r.match.yokOdds != null ? parseFloat(r.match.yokOdds) : null,
      avgOddsMin: r.match.avgOddsMin != null ? parseFloat(r.match.avgOddsMin) : null,
      avgOddsMax: r.match.avgOddsMax != null ? parseFloat(r.match.avgOddsMax) : null,
    },
    similarityScore: r.similarityScore,
    scoreBreakdown: r.scoreBreakdown,
  }));

  res.json(serialized);
});

// DELETE /matches/:id
router.delete("/matches/:id", async (req, res): Promise<void> => {
  const params = DeleteMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(historicalMatchesTable)
    .where(eq(historicalMatchesTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
