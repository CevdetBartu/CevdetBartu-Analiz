import { Router } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireUser } from "../lib/userAuthMiddleware";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const db = new Database(dbPath);

const router = Router();

// GET /api/settings/me
router.get("/me", requireUser, (req, res) => {
  try {
    const user = db.prepare("SELECT email_notifications FROM users WHERE id = ?").get(req.user?.id) as any;
    res.json({ email_notifications: !!user?.email_notifications });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/settings/notifications
router.put("/notifications", requireUser, (req, res) => {
  try {
    const { email_notifications } = req.body;
    db.prepare("UPDATE users SET email_notifications = ? WHERE id = ?").run(email_notifications ? 1 : 0, req.user?.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/unsubscribe/:hash
router.get("/unsubscribe/:hash", (req, res) => {
  try {
    const hash = req.params.hash;
    // Bütün kullanıcıları çekip hash'i eşleşeni buluyoruz (Küçük ölçekli projeler için yeterli)
    const users = db.prepare("SELECT id, email FROM users WHERE email_notifications = 1").all() as any[];
    
    let unsubscribedEmail = null;
    for (const u of users) {
      // Hash mantığı: md5(email + gizli_tuz)
      // Şifre tuzunu çevre değişkeninden veya sabit bir kelimeden alıyoruz
      const expectedHash = crypto.createHmac('sha256', "karga_newsletter_secure_hmac_key_2026").update(u.email).digest('hex');
      if (expectedHash === hash) {
        db.prepare("UPDATE users SET email_notifications = 0 WHERE id = ?").run(u.id);
        unsubscribedEmail = u.email;
        break;
      }
    }

    if (unsubscribedEmail) {
      res.json({ success: true, message: "Abonelik başarıyla iptal edildi." });
    } else {
      res.status(400).json({ error: "Geçersiz link veya zaten abonelikten çıkılmış." });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
