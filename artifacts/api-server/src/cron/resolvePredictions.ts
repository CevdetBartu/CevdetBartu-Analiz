import cron from "node-cron";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

// Yardımcı fonksiyon: skoru parçala ("2-1", "0:0", "3 - 2" vs destekler)
function parseScore(scoreStr: string): { h: number; a: number } | null {
  if (!scoreStr) return null;
  const match = scoreStr.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  return { h: parseInt(match[1]), a: parseInt(match[2]) };
}

// Tahmin sonucunu değerlendirir
function evaluatePrediction(predType: string, predValue: string, ftScore: string | null, htScore: string | null): string {
  // Eğer skor "Postp." (Ertelendi), "Canc." (İptal) veya harf içeriyorsa iptal (void) sayalım
  if (ftScore && /[a-zA-Z]/.test(ftScore)) {
    return 'void';
  }

  const ft = parseScore(ftScore || "");
  const ht = parseScore(htScore || "");

  if (!ft) return 'pending'; // skor henüz yok

  const homeFt = ft.h, awayFt = ft.a, totalGoals = ft.h + ft.a;
  
  try {
    switch (predType) {
      case 'MS1X2':
        if (predValue === '1' && homeFt > awayFt) return 'correct';
        if (predValue === 'X' && homeFt === awayFt) return 'correct';
        if (predValue === '2' && homeFt < awayFt) return 'correct';
        return 'incorrect';

      case 'ALT_UST_2_5':
        if (predValue === 'UST' && totalGoals >= 3) return 'correct';
        if (predValue === 'ALT' && totalGoals <= 2) return 'correct';
        return 'incorrect';

      case 'KG_VAR_YOK':
        const kg = (homeFt > 0 && awayFt > 0);
        if (predValue === 'VAR' && kg) return 'correct';
        if (predValue === 'YOK' && !kg) return 'correct';
        return 'incorrect';

      default:
        return 'void'; // Bilinmeyen tip
    }
  } catch(e) {
    return 'pending'; // Bir hata varsa beklemede bırak
  }
}

export function startPredictionResolver() {
  // Her 5 dakikada bir çalıştır
  cron.schedule("*/5 * * * *", () => {
    try {
      const db = new Database(dbPath);
      // Bekleyen ve maçı başlamış olan tahminleri çek (Maç başlamadan sonuç çıkmaz gerçi)
      const pendingPreds = db.prepare(`
        SELECT p.id, p.prediction_type, p.predicted_value, 
               m.mac_skoru, m.devre_skoru, m.saat, m.tarih
        FROM user_predictions p
        JOIN gecmis_maclar m ON p.match_id = m.id
        WHERE p.status = 'pending'
      `).all() as any[];

      if (pendingPreds.length === 0) return;

      let resolvedCount = 0;
      const updateStmt = db.prepare("UPDATE user_predictions SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?");

      // İşlemleri Transaction içinde yap
      const resolveTx = db.transaction((preds) => {
        for (const p of preds) {
          // mac_skoru sütunu dolu mu kontrol et (Boşlukları kırptıktan sonra)
          const macSkoru = p.mac_skoru ? p.mac_skoru.trim() : null;
          
          if (!macSkoru || macSkoru === '-' || macSkoru === '') continue; // Maç henüz bitmemiş

          const newStatus = evaluatePrediction(p.prediction_type, p.predicted_value, macSkoru, p.devre_skoru);
          
          if (newStatus !== 'pending') {
            updateStmt.run(newStatus, p.id);
            resolvedCount++;
          }
        }
      });

      resolveTx(pendingPreds);
      
      if (resolvedCount > 0) {
        logger.info(`[CRON] Resolved ${resolvedCount} pending user predictions.`);
      }

    } catch (e: any) {
      logger.error({ err: e }, "Prediction Resolver Cron Job Error");
    }
  });
  
  logger.info("Prediction Resolver Cron Job Started (runs every 5m).");
}
