import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historicalMatchesTable = pgTable("historical_matches", {
  id: serial("id").primaryKey(),
  matchDate: text("match_date"),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  htScore: text("ht_score"),
  ftScore: text("ft_score").notNull(),
  previousScore: text("previous_score"),
  yellowCardsHome: integer("yellow_cards_home"),
  yellowCardsAway: integer("yellow_cards_away"),
  redCards: integer("red_cards"),
  ligSirasiHome: integer("lig_sirasi_home"),
  ligSirasiAway: integer("lig_sirasi_away"),
  ligSirasiTotal: integer("lig_sirasi_total"),
  oddsHome: numeric("odds_home", { precision: 6, scale: 2 }).notNull(),
  oddsDraw: numeric("odds_draw", { precision: 6, scale: 2 }).notNull(),
  oddsAway: numeric("odds_away", { precision: 6, scale: 2 }).notNull(),
  altOdds: numeric("alt_odds", { precision: 6, scale: 2 }),
  ustOdds: numeric("ust_odds", { precision: 6, scale: 2 }),
  varOdds: numeric("var_odds", { precision: 6, scale: 2 }),
  yokOdds: numeric("yok_odds", { precision: 6, scale: 2 }),
  altOdds35: numeric("alt_odds_35", { precision: 6, scale: 2 }),
  ustOdds35: numeric("ust_odds_35", { precision: 6, scale: 2 }),
  iyAltOdds15: numeric("iy_alt_odds_15", { precision: 6, scale: 2 }),
  iyUstOdds15: numeric("iy_ust_odds_15", { precision: 6, scale: 2 }),
  iyAltOdds05: numeric("iy_alt_odds_05", { precision: 6, scale: 2 }),
  iyUstOdds05: numeric("iy_ust_odds_05", { precision: 6, scale: 2 }),
  avgOddsMin: numeric("avg_odds_min", { precision: 6, scale: 2 }),
  avgOddsMax: numeric("avg_odds_max", { precision: 6, scale: 2 }),
  imResult: text("im_result"),
  kornerHome: integer("korner_home"),
  kornerAway: integer("korner_away"),
  kita: text("kita"),
  ligSeviyesi: text("lig_seviyesi"),
  teknikDirektorEv: text("teknik_direktor_ev"),
  teknikDirektorDep: text("teknik_direktor_dep"),
  hakem: text("hakem"),
  stadyum: text("stadyum"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(historicalMatchesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type HistoricalMatch = typeof historicalMatchesTable.$inferSelect;
