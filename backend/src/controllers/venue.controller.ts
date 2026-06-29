import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.js";
import { VenueService } from "../services/venue.service.js";
import { serializeVenue } from "../lib/serialize.js";

const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  sportTypes: z.array(z.string().min(1)).min(1),
  pricePerHour: z.number().positive(),
  capacity: z.number().int().positive(),
});

const boolFlag = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();

const listQuerySchema = z.object({
  sport: z.string().min(1).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  openToday: boolFlag,
  openThisWeek: boolFlag,
});

export async function createVenue(req: AuthRequest, res: Response) {
  const p = venueSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.status(201).json(serializeVenue(await VenueService.createVenue(p.data, req.user!.id)));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function listVenues(req: AuthRequest, res: Response) {
  const p = listQuerySchema.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.json((await VenueService.listVenues(p.data)).map(serializeVenue));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function getVenue(req: AuthRequest, res: Response) {
  try {
    res.json(serializeVenue(await VenueService.getVenue(req.params.id as string)));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function updateVenue(req: AuthRequest, res: Response) {
  const p = venueSchema.partial().safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.json(serializeVenue(await VenueService.updateVenue(req.params.id as string, p.data, req.user!.id)));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function deleteVenue(req: AuthRequest, res: Response) {
  try {
    res.json(await VenueService.deleteVenue(req.params.id as string, req.user!.id));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}
