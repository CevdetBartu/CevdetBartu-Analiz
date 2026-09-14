import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router: IRouter = Router();
const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");

// JWT Secret - production'da env'den alinmali, fallback eklendi
const JWT_SECRET = process.env.JWT_SECRET || "karga_jwt_super_secret_2026_fallback";

// Rate limiting (15 dakikada 10 istek)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Çok fazla deneme yaptınız, lütfen 15 dakika sonra tekrar deneyin." }
});

// Kayit olma (Register)
router.post("/register", authLimiter, (req, res) => {
  const { email, password, kvkk } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email ve şifre zorunludur." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Şifre en az 8 karakter olmalıdır." });
    return;
  }

  if (kvkk !== true) {
    res.status(400).json({ error: "Kayıt olmak için gizlilik politikasını kabul etmelisiniz." });
    return;
  }

  try {
    const db = new Database(dbPath);
    
    // Email kullaniliyor mu kontrolu
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      res.status(400).json({ error: "Bu email adresi zaten kullanılıyor." });
      return;
    }

    // Sifreyi hashle
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const insertStmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    insertStmt.run(email, hash);

    res.json({ success: true, message: "Kayıt başarılı! Lütfen giriş yapın." });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

// Giris (Login)
router.post("/login", authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email ve şifre zorunludur." });
    return;
  }

  try {
    const db = new Database(dbPath);
    const user: any = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email);

    if (!user) {
      res.status(401).json({ error: "Hatalı email veya şifre!" });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: "Hatalı email veya şifre!" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" } // 1 haftalik gecerlilik
    );

    res.json({ success: true, token, email: user.email });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

// Cikis (Logout)
router.post("/logout", (req, res) => {
  // Frontend tokeni sildigi icin backend'de islem yapmaya gerek yok, basarili donuyoruz
  res.json({ success: true, message: "Çıkış yapıldı." });
});

export default router;
