import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = fs.existsSync("/var/www/futbol_app/gecmis_maclar.db") 
  ? "/var/www/futbol_app/gecmis_maclar.db" 
  : path.resolve(__dirnameLocal, "../../../../gecmis_maclar.db");

const db = new Database(dbPath);

export function logAudit(adminEmail: string, action: string, target?: string) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (admin_email, action, target)
      VALUES (?, ?, ?)
    `).run(adminEmail, action, target || null);
  } catch (err) {
    console.error("Failed to insert audit log:", err);
  }
}
