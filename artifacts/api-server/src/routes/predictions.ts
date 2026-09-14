import { Router } from "express";
import rateLimit from "express-rate-limit";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();
const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../scripts/scraper/gecmis_maclar.db");

// Rate limiting: Saniyede spam atılmasın (dakikada 30 tahmin limiti makul)
const predictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: "Çok hızlı işlem yapıyorsunuz. Biraz bekleyin." }
});

// Yardımcı Fonksiyon: Maçın başlayıp başlamadığını kontrol eder
function hasMatchStarted(matchId: number): boolean {
  try {
    const db = new Database(dbPath);
    const m: any = db.prepare("SELECT tarih, saat FROM gecmis_maclar WHERE id = ?").get(matchId);
    if (!m) return true; // Maç yoksa başlatılmış/kapanmış kabul et
    
    // tarih: "14.09.2026" veya "2026-09-14", saat: "21:45"
    let isoDate = m.tarih;
    if (isoDate && isoDate.includes(".")) {
      const [d, mo, y] = isoDate.split(".");
      isoDate = `${y}-${mo}-${d}`;
    }
    
    if (!isoDate || !m.saat) return true; // Hatalı veriyse kapa
    
    const matchDateTime = new Date(`${isoDate}T${m.saat}:00+03:00`); // TR saati (+3)
    const now = new Date();
    
    // Maç saati şu anki saatten geçmişse kilitlidir
    return now.getTime() >= matchDateTime.getTime();
  } catch(e) {
    return true;
  }
}

// 1. Yeni Tahmin Ekle (POST /api/predictions)
router.post("/", predictLimiter, (req: any, res) => {
  const { match_id, prediction_type, predicted_value } = req.body;
  const user_id = req.user.userId;

  if (!match_id || !prediction_type || !predicted_value) {
    return res.status(400).json({ error: "Eksik parametreler" });
  }

  if (hasMatchStarted(match_id)) {
    return res.status(403).json({ error: "Bu maç başlamış, tahmin yapamazsınız." });
  }

  try {
    const db = new Database(dbPath);
    // Varsa güncelle (upsert mantığı), yoksa ekle
    // SQLite'da upsert icin: INSERT ... ON CONFLICT ... DO UPDATE
    db.prepare(`
      INSERT INTO user_predictions (user_id, match_id, prediction_type, predicted_value)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, match_id, prediction_type) DO UPDATE SET
        predicted_value=excluded.predicted_value,
        status='pending',
        created_at=CURRENT_TIMESTAMP
    `).run(user_id, match_id, prediction_type, predicted_value);

    res.json({ success: true, message: "Tahmin kaydedildi." });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

// 2. Tahmin Geçmişini Listele (GET /api/predictions/me)
router.get("/me", (req: any, res) => {
  const user_id = req.user.userId;
  const status = req.query.status as string; // 'pending' | 'resolved' vs.
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const db = new Database(dbPath);
    
    let whereClause = "WHERE p.user_id = ?";
    const params: any[] = [user_id];

    if (status === 'pending') {
      whereClause += " AND p.status = 'pending'";
    } else if (status === 'resolved') {
      whereClause += " AND p.status IN ('correct', 'incorrect', 'void')";
    }

    const query = `
      SELECT p.id, p.prediction_type, p.predicted_value, p.status, p.created_at, p.resolved_at,
             m.ev_sahibi, m.deplasman, m.tarih, m.saat, m.mac_skoru, m.lig
      FROM user_predictions p
      JOIN gecmis_maclar m ON p.match_id = m.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const predictions = db.prepare(query).all(...params);
    
    const countQuery = `SELECT COUNT(*) as count FROM user_predictions p ${whereClause}`;
    const totalCount: any = db.prepare(countQuery).get(...params.slice(0, -2));

    res.json({
      success: true,
      data: predictions,
      pagination: {
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

// 3. Kullanıcı Tahmin İstatistikleri (GET /api/predictions/me/stats)
router.get("/me/stats", (req: any, res) => {
  const user_id = req.user.userId;

  try {
    const db = new Database(dbPath);
    const stats: any = db.prepare(`
      SELECT 
        COUNT(id) as total_predictions,
        SUM(CASE WHEN status = 'correct' THEN 1 ELSE 0 END) as correct_predictions,
        SUM(CASE WHEN status = 'incorrect' THEN 1 ELSE 0 END) as incorrect_predictions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_predictions
      FROM user_predictions
      WHERE user_id = ? AND status != 'void'
    `).get(user_id);

    const correct = stats.correct_predictions || 0;
    const incorrect = stats.incorrect_predictions || 0;
    const resolvedTotal = correct + incorrect;
    const winRate = resolvedTotal > 0 ? ((correct / resolvedTotal) * 100).toFixed(1) : "0.0";

    // En çok tahmin edilen lig
    const favLeague: any = db.prepare(`
      SELECT m.lig, COUNT(p.id) as cnt
      FROM user_predictions p
      JOIN gecmis_maclar m ON p.match_id = m.id
      WHERE p.user_id = ?
      GROUP BY m.lig
      ORDER BY cnt DESC
      LIMIT 1
    `).get(user_id);

    res.json({
      success: true,
      stats: {
        total: stats.total_predictions || 0,
        pending: stats.pending_predictions || 0,
        correct,
        incorrect,
        winRate,
        favoriteLeague: favLeague ? favLeague.lig : "-"
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

export default router;
