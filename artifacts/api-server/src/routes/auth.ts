import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_SECRET_KEY || "karga-secret-admin-key-9988";

// Sadece Admin paneline giris icin (Kullanici girisi userAuth.ts icinde)
router.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_TOKEN) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, error: "Hatalı şifre!" });
  }
});

export default router;
