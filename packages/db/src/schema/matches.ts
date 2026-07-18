import { sqliteTable, text, integer, numeric } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historicalMatchesTable = sqliteTable("gecmis_maclar", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchDate: text("tarih"),
  league: text("lig").notNull(),
  homeTeam: text("ev_sahibi").notNull(),
  awayTeam: text("deplasman").notNull(),
  htScore: text("devre_skoru"),
  ftScore: text("mac_skoru").notNull(),
  previousScore: text("onceki_skorlar"),
  yellowCardsHome: integer("kart_ev"),
  yellowCardsAway: integer("kart_dep"),
  redCards: integer("kirmizi_kart"),
  ligSirasiHome: integer("lig_sira_ev"),
  ligSirasiAway: integer("lig_sira_dep"),
  ligSirasiTotal: integer("toplam_takim"),
  oddsHome: numeric("oran_1").notNull(),
  oddsDraw: numeric("oran_x").notNull(),
  oddsAway: numeric("oran_2").notNull(),
  altOdds: numeric("alt_orani"),
  ustOdds: numeric("ust_orani"),
  varOdds: numeric("kg_var"),
  yokOdds: numeric("kg_yok"),
  avgOddsMin: numeric("ort_min"),
  avgOddsMax: numeric("ort_max"),
  imResult: text("im_6"),
  kornerHome: integer("korner_ev"),
  kornerAway: integer("korner_dep"),
  createdAt: text("olusturma_tarihi").default("CURRENT_TIMESTAMP"),
});

export const insertMatchSchema = createInsertSchema(historicalMatchesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type HistoricalMatch = typeof historicalMatchesTable.$inferSelect;
