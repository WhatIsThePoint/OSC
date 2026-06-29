import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.js";
import { AvailabilityService } from "../services/availability.service.js";

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM");

const rulesSchema = z.object({
  rules: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: hhmm,
        endTime: hhmm,
      })
    )
    .min(1),
});

export async function setRules(req: AuthRequest, res: Response) {
  const p = rulesSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.json(await AvailabilityService.setRules(req.params.id as string, req.user!.id, p.data.rules));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function getRules(req: AuthRequest, res: Response) {
  try {
    res.json(await AvailabilityService.getRules(req.params.id as string));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function getSlots(req: AuthRequest, res: Response) {
  try {
    res.json(await AvailabilityService.getSlotsForWeek(req.params.id as string));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function generateSlots(req: AuthRequest, res: Response) {
  try {
    res.json(
      await AvailabilityService.generateSlotsForUpcomingWeek(req.params.id as string, req.user!.id)
    );
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}
