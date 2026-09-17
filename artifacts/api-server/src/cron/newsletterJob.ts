import cron from "node-cron";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";
import crypto from "node:crypto";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

export function startNewsletterJob() {
  // Her Pazar saat 18:00
  cron.schedule("0 18 * * 0", async () => {
    logger.info("[CRON] Starting Weekly Newsletter Job...");
    try {
      const db = new Database(DB_PATH);
      const RESEND_API_KEY = process.env.RESEND_API_KEY;

      if (!RESEND_API_KEY) {
        logger.warn("[CRON] RESEND_API_KEY is not set. Newsletter will not be sent.");
        return;
      }

      // 1. Sistem Basari Orani (Son 7 gun)
      const systemStats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ms_status = 'correct' THEN 1 ELSE 0 END) as correct
        FROM system_predictions 
        WHERE date >= date('now', '-7 days')
      `).get() as any;
      
      const systemRate = systemStats.total > 0 ? ((systemStats.correct / systemStats.total) * 100).toFixed(1) : "Bilinmiyor";

      // 2. Email almak isteyen kullanicilar (son 7 gunden eski kayitli olanlar)
      const users = db.prepare(`
        SELECT id, username, email FROM users 
        WHERE email_notifications = 1 
        AND created_at <= datetime('now', '-7 days')
      `).all() as any[];

      logger.info(`[CRON] Found ${users.length} users subscribed to the newsletter.`);

      // Batching: 50'serli gruplar halinde gonder (Rate limit)
      const BATCH_SIZE = 50;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        
        for (const user of batch) {
          // Kullanici kisisel basarisi
          const userStats = db.prepare(`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'correct' THEN 1 ELSE 0 END) as correct
            FROM user_predictions 
            WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
          `).get(user.id) as any;
          
          let personalMessage = "Bu hafta henüz sisteme tahmin girmedin. Yeni oranları keşfetmek için hemen siteye göz at!";
          if (userStats.total > 0) {
            const userRate = ((userStats.correct / userStats.total) * 100).toFixed(1);
            personalMessage = `Bu hafta harika iş çıkardın! Yaptığın ${userStats.total} tahminde <strong>%${userRate} isabet</strong> oranına ulaştın.`;
          }

          const unsubscribeHash = crypto.createHmac('sha256', "karga_newsletter_secure_hmac_key_2026").update(user.email).digest('hex');
          const unsubscribeUrl = `https://kargatahmin.com/unsubscribe/${unsubscribeHash}`;

          const emailHtml = `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #0f172a;">Merhaba ${user.username || 'Futbol Sever'},</h1>
              <p>Haftalık KargaTahmin analiz bültenine hoş geldin!</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0;">Geçtiğimiz Haftanın Özeti</h3>
                <p>Sistem algoritmamız geçen haftaki maçlarda <strong>%${systemRate} başarı</strong> yakaladı.</p>
                <p>${personalMessage}</p>
              </div>

              <a href="https://kargatahmin.com/bugun" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Günün İstatistiklerini Gör →</a>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0 20px;" />
              
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                <strong>Yasal Uyarı:</strong> KargaTahmin tarafından sunulan içerikler, tamamen yapay zeka algoritması ve geçmiş istatistiksel veriler kullanılarak üretilmiş bilgilendirme amaçlı analizlerdir. KargaTahmin, herhangi bir şekilde bahis oynamaya teşvik etmez, "kesin kazanç" garantisi vermez. Alınacak tüm kararların sorumluluğu tamamen kullanıcının kendisine aittir.<br><br>
                Bu e-postayı, bildirim ayarlarınız açık olduğu için aldınız. <a href="${unsubscribeUrl}" style="color: #ef4444;">Abonelikten Çıkmak İçin Tıklayın</a>.
              </p>
            </div>
          `;

          // Resend API Request
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "KargaTahmin <newsletter@kargatahmin.com>",
              to: [user.email],
              subject: "Haftalık Analiz Özeti ve Başarı Oranları",
              html: emailHtml
            })
          });

          // Nefes aldir
          await new Promise(r => setTimeout(r, 50));
        }

        logger.info(`[CRON] Processed newsletter batch (${i + BATCH_SIZE}/${users.length}). Waiting 2s before next batch...`);
        // Batch arasi 2 saniye bekle (Rate Limit korumasi)
        await new Promise(r => setTimeout(r, 2000));
      }
      
      logger.info("[CRON] Weekly Newsletter Job completed successfully.");
    } catch (e: any) {
      logger.error({ err: e }, "Newsletter Cron Error");
    }
  });
  
  logger.info("Newsletter Cron Job Started (runs every Sunday at 18:00).");
}
