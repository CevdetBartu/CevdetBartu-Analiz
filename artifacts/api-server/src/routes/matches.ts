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
        altOdds35: parsed.data.altOdds35 != null ? String(parsed.data.altOdds35) : null,
        ustOdds35: parsed.data.ustOdds35 != null ? String(parsed.data.ustOdds35) : null,
        iyAltOdds15: parsed.data.iyAltOdds15 != null ? String(parsed.data.iyAltOdds15) : null,
        iyUstOdds15: parsed.data.iyUstOdds15 != null ? String(parsed.data.iyUstOdds15) : null,
        iyAltOdds05: parsed.data.iyAltOdds05 != null ? String(parsed.data.iyAltOdds05) : null,
        iyUstOdds05: parsed.data.iyUstOdds05 != null ? String(parsed.data.iyUstOdds05) : null,
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
      oddsType,
      parsed.data.league
    );
  } catch (e: any) {
    console.error("queryScraperMatches error:", e);
  }

  // Deduplicate matches by ID, keeping the one with more populated odds
  const uniqueMatchesMap = new Map<string | number, any>();
  for (const m of [...scraperMatches, ...pgMatches]) {
    const id = m.id;
    if (id == null) continue;
    const existing = uniqueMatchesMap.get(id);
    if (!existing) {
      uniqueMatchesMap.set(id, m);
    } else {
      const countOdds = (x: any) => {
        let cnt = 0;
        if (x.altOdds != null && x.altOdds > 1.0) cnt++;
        if (x.ustOdds != null && x.ustOdds > 1.0) cnt++;
        if (x.varOdds != null && x.varOdds > 1.0) cnt++;
        if (x.yokOdds != null && x.yokOdds > 1.0) cnt++;
        if (x.altOdds35 != null && x.altOdds35 > 1.0) cnt++;
        if (x.ustOdds35 != null && x.ustOdds35 > 1.0) cnt++;
        return cnt;
      };
      if (countOdds(m) > countOdds(existing)) {
        uniqueMatchesMap.set(id, m);
      }
    }
  }
  const allMatches = Array.from(uniqueMatchesMap.values());

  const results = findSimilarMatches(
    {
      oddsHome: parsed.data.oddsHome,
      oddsDraw: parsed.data.oddsDraw,
      oddsAway: parsed.data.oddsAway,
      altOdds: parsed.data.altOdds ?? null,
      ustOdds: parsed.data.ustOdds ?? null,
      varOdds: parsed.data.varOdds ?? null,
      yokOdds: parsed.data.yokOdds ?? null,
      altOdds35: parsed.data.altOdds35 ?? null,
      ustOdds35: parsed.data.ustOdds35 ?? null,
      iyAltOdds15: parsed.data.iyAltOdds15 ?? null,
      iyUstOdds15: parsed.data.iyUstOdds15 ?? null,
      iyAltOdds05: parsed.data.iyAltOdds05 ?? null,
      iyUstOdds05: parsed.data.iyUstOdds05 ?? null,
      league: parsed.data.league ?? null,
      maxResults: parsed.data.maxResults ?? null,
      homeTeam: (req.body as any)?.homeTeam ?? null,
      awayTeam: (req.body as any)?.awayTeam ?? null,
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
      altOdds35: r.match.altOdds35 != null ? parseFloat(r.match.altOdds35) : null,
      ustOdds35: r.match.ustOdds35 != null ? parseFloat(r.match.ustOdds35) : null,
      iyAltOdds15: r.match.iyAltOdds15 != null ? parseFloat(r.match.iyAltOdds15) : null,
      iyUstOdds15: r.match.iyUstOdds15 != null ? parseFloat(r.match.iyUstOdds15) : null,
      iyAltOdds05: r.match.iyAltOdds05 != null ? parseFloat(r.match.iyAltOdds05) : null,
      iyUstOdds05: r.match.iyUstOdds05 != null ? parseFloat(r.match.iyUstOdds05) : null,
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
      alt_orani_35_acilis: (r.match as any).alt_orani_35_acilis,
      ust_orani_35_acilis: (r.match as any).ust_orani_35_acilis,
      iy_alt_orani_15_acilis: (r.match as any).iy_alt_orani_15_acilis,
      iy_ust_orani_15_acilis: (r.match as any).iy_ust_orani_15_acilis,
      iy_alt_orani_05_acilis: (r.match as any).iy_alt_orani_05_acilis,
      iy_ust_orani_05_acilis: (r.match as any).iy_ust_orani_05_acilis,
      
      oran_1_kapanis: (r.match as any).oran_1_kapanis,
      oran_x_kapanis: (r.match as any).oran_x_kapanis,
      oran_2_kapanis: (r.match as any).oran_2_kapanis,
      alt_orani_kapanis: (r.match as any).alt_orani_kapanis,
      ust_orani_kapanis: (r.match as any).ust_orani_kapanis,
      kg_var_kapanis: (r.match as any).kg_var_kapanis,
      kg_yok_kapanis: (r.match as any).kg_yok_kapanis,
      alt_orani_35_kapanis: (r.match as any).alt_orani_35_kapanis,
      ust_orani_35_kapanis: (r.match as any).ust_orani_35_kapanis,
      iy_alt_orani_15_kapanis: (r.match as any).iy_alt_orani_15_kapanis,
      iy_ust_orani_15_kapanis: (r.match as any).iy_ust_orani_15_kapanis,
      iy_alt_orani_05_kapanis: (r.match as any).iy_alt_orani_05_kapanis,
      iy_ust_orani_05_kapanis: (r.match as any).iy_ust_orani_05_kapanis,
    },
    similarityScore: r.similarityScore,
    scoreBreakdown: r.scoreBreakdown,
  }));

  res.json(serialized);
});

// POST /h2h-matches — search direct H2H history from gecmis_maclar.db
router.post("/h2h-matches", async (req, res): Promise<void> => {
  const { homeTeam, awayTeam } = req.body;
  if (!homeTeam || !awayTeam) {
    res.status(400).json({ error: "homeTeam and awayTeam required" });
    return;
  }

  try {
    const { queryH2HMatches } = await import("../lib/scraperDb");
    const matches = queryH2HMatches(String(homeTeam), String(awayTeam));
    res.json({ matches });
  } catch (e: any) {
    console.error("h2h-matches endpoint error:", e);
    res.json({ matches: [] });
  }
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
