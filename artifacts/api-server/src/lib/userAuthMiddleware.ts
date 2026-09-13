import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "crs_jwt_super_secret_2026_fallback";

// Request interfacesini genisletmek
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Yetkisiz erişim. Lütfen giriş yapın." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın." });
    return;
  }
}
