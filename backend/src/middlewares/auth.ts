import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Venue } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
  venue?: Venue;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as AuthRequest["user"];
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
