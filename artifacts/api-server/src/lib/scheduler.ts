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

  // Her gün saat 08:00 (sunucu zamanı — genellikle UTC; TR için CRON_TZ veya 05:00 UTC kullanılır)
  cron.schedule("0 5 * * *", async () => {
    logger.info("Günlük maç verisi güncelleme başlatılıyor (08:00 TR)...");
    try {
      const result = await refreshTodayMatches();
      logger.info({ result }, "Günlük maç güncelleme tamamlandı");
    } catch (e: any) {
      logger.error({ err: e }, "Günlük maç güncelleme hatası");
    }
  });

  logger.info("Günlük maç scheduler başlatıldı (08:00 TR / 05:00 UTC)");
}
