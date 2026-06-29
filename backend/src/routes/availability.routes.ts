import { Router } from "express";
import { setRules, getRules, getSlots, generateSlots } from "../controllers/availability.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireOwnership } from "../middlewares/ownership.js";

const router = Router();
router.get("/:id/rules", getRules);
router.put("/:id/rules", requireAuth, requireOwnership, setRules);
router.get("/:id/slots", getSlots);
router.post("/:id/generate", requireAuth, requireOwnership, generateSlots);
export default router;
