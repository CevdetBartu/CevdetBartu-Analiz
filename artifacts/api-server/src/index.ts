import app from "./app";
import { logger } from "./lib/logger";
import { startDailyMatchScheduler } from "./lib/scheduler";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const isProd = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db");
const dbPath = isProd ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../scripts/scraper/gecmis_maclar.db");


// Create users table
try {
  const db = new Database(dbPath, { readonly: false });
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add new columns if they do not exist
  try { db.exec("ALTER TABLE users ADD COLUMN membership_status TEXT DEFAULT 'active'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN membership_plan TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0"); } catch (e) {}

  logger.info("Users table checked/updated.");
} catch (e: any) {

  logger.error({ err: e }, "DB users tablo oluturma hatas");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startDailyMatchScheduler();
});
