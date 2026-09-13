import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.ADMIN_TOKEN || "crs_super_secret_token_2026";

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    res.status(401).json({ error: "Yetkisiz erişim. Admin girişi yapmanız gerekmektedir." });
    return;
  }

  next();
}
