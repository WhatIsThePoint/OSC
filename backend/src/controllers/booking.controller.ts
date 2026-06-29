import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { BookingService } from "../services/booking.service.js";

export async function hold(req: AuthRequest, res: Response) {
  try {
    res.json(await BookingService.holdSlot(req.params.slotId as string, req.user!.id));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function confirm(req: AuthRequest, res: Response) {
  try {
    res.status(201).json(await BookingService.confirmBooking(req.params.slotId as string, req.user!.id));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function release(req: AuthRequest, res: Response) {
  try {
    res.json(await BookingService.releaseHold(req.params.slotId as string, req.user!.id));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}
