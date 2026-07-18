/**
 * Günlük maç verisi yenileme scheduler'ı.
 * Her sabah 08:00'de scraper'ı tetikler.
 */
import cron from "node-cron";
import { logger } from "./logger";
import { refreshTodayMatches } from "./todayMatches";

let scheduled = false;

export function startDailyMatchScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  // Her gün saat 00:00 TR (21:00 UTC)
  cron.schedule("0 21 * * *", async () => {
    logger.info("Günlük maç verisi güncelleme başlatılıyor (00:00 TR)...");
    try {
      const result = await refreshTodayMatches();
      logger.info({ result }, "Günlük maç güncelleme tamamlandı");

      // Geçmiş maç havuzuna dünün verilerini eklemek için scraper'ı (1 sezon) başlat
      logger.info("Geçmiş maç havuzu güncellemesi başlatılıyor...");
      try {
        const startResp = await fetch("http://127.0.0.1:5051/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seasons_back: 1 }),
        });
        if (startResp.ok) {
          logger.info("Scraper (1 sezon) başarıyla başlatıldı.");
        } else {
          logger.warn(`Scraper başlatılamadı: ${startResp.status}`);
        }
      } catch (err: any) {
        logger.error({ err }, "Scraper başlatma hatası");
      }
    } catch (e: any) {
      logger.error({ err: e }, "Günlük maç güncelleme hatası");
    }
  });

  logger.info("Günlük maç scheduler başlatıldı (00:00 TR / 21:00 UTC)");
}
