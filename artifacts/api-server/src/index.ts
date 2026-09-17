import app from "./app";
import { logger } from "./lib/logger";
import { startDailyMatchScheduler } from "./lib/scheduler";
import { startPredictionResolver } from "./cron/resolvePredictions";
import { startSystemPredictionsJob } from "./cron/systemPredictionsJob";
import { startBlogDraftJob } from "./cron/blogDraftJob";
import { startNewsletterJob } from "./cron/newsletterJob";

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
  try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0"); } catch (e) {}

  try { db.exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN last_login_at DATETIME DEFAULT NULL"); } catch (e) {}
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL
      )
    `);
  } catch(e) {}

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch(e) {}


  logger.info("Users table checked/updated.");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        match_id INTEGER NOT NULL,
        prediction_type TEXT NOT NULL,
        predicted_value TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, match_id, prediction_type)
      )
    `);
    logger.info("user_predictions table checked/updated.");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL UNIQUE,
        date TEXT,
        league TEXT,
        ms_prediction TEXT,
        ms_prob REAL,
        ms_status TEXT DEFAULT 'pending',
        ou_prediction TEXT,
        ou_prob REAL,
        ou_status TEXT DEFAULT 'pending',
        btts_prediction TEXT,
        btts_prob REAL,
        btts_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME DEFAULT NULL,
        FOREIGN KEY (match_id) REFERENCES gecmis_maclar(id)
      )
    `);
    logger.info("system_predictions table checked/updated.");
  } catch(e) {}

  } catch(e) {}

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
  startPredictionResolver();
  startSystemPredictionsJob();
  startBlogDraftJob();
  startNewsletterJob();
});
