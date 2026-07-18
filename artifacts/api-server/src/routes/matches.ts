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
  try {
    const matches = await db
      .select()
      .from(historicalMatchesTable)
      .orderBy(historicalMatchesTable.createdAt);
    res.json(matches);
  } catch (e: any) {
    res.json([]);
  }
});

// POST /matches — create
router.post("/matches", async (req, res): Promise<void> => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
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
  } catch (e: any) {
    res.status(500).json({ error: "Veritabanı bağlantı hatası." });
  }
});

// POST /matches/find-similar
router.post("/matches/find-similar", async (req, res): Promise<void> => {
  const parsed = FindSimilarMatchesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let pgMatches: any[] = [];
  try {
    pgMatches = await db.select().from(historicalMatchesTable);
  } catch (e: any) {
    // PostgreSQL bağlı değilse veya tablo yoksa sessizce devam et
  }

  const oddsType = (req.body.oddsType === "OPENING" || req.body.oddsType === "CLOSING")
    ? req.body.oddsType
    : "CLOSING";

  let scraperMatches: typeof pgMatches = [];
  try {
    scraperMatches = queryScraperMatches(
      parsed.data.oddsHome,
      parsed.data.oddsDraw,
      parsed.data.oddsAway,
      oddsType
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
      
      // Detaylı açılış/kapanış oranlarını ekle
      oran_1_acilis: (r.match as any).oran_1_acilis,
      oran_x_acilis: (r.match as any).oran_x_acilis,
      oran_2_acilis: (r.match as any).oran_2_acilis,
      alt_orani_acilis: (r.match as any).alt_orani_acilis,
      ust_orani_acilis: (r.match as any).ust_orani_acilis,
      kg_var_acilis: (r.match as any).kg_var_acilis,
      kg_yok_acilis: (r.match as any).kg_yok_acilis,
      
      oran_1_kapanis: (r.match as any).oran_1_kapanis,
      oran_x_kapanis: (r.match as any).oran_x_kapanis,
      oran_2_kapanis: (r.match as any).oran_2_kapanis,
      alt_orani_kapanis: (r.match as any).alt_orani_kapanis,
      ust_orani_kapanis: (r.match as any).ust_orani_kapanis,
      kg_var_kapanis: (r.match as any).kg_var_kapanis,
      kg_yok_kapanis: (r.match as any).kg_yok_kapanis,
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
  try {
    const [deleted] = await db
      .delete(historicalMatchesTable)
      .where(eq(historicalMatchesTable.id, params.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    res.sendStatus(204);
  } catch (e: any) {
    res.status(500).json({ error: "Veritabanı bağlantı hatası." });
  }
});

export default router;
