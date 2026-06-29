import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service.js";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const p = credsSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.status(201).json(await AuthService.register(p.data.email, p.data.password));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  const p = credsSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  try {
    res.json(await AuthService.login(p.data.email, p.data.password));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
}

// JWT is stateless: logout is client-side token discard. Endpoint kept for API completeness.
export function logout(_req: Request, res: Response) {
  res.json({ message: "Logged out" });
}
