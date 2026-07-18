export * from "./schema";

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const dbPath = process.env.DATABASE_URL || defaultDbPath;

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
export { historicalMatchesTable } from "./schema";
