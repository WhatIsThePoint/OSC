import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "./auth.js";

export async function requireOwnership(req: AuthRequest, res: Response, next: NextFunction) {
  const venue = await prisma.venue.findUnique({ where: { id: req.params.id as string } });
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  if (venue.ownerId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
  req.venue = venue;
  next();
}
