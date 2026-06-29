import { Router } from "express";
import { hold, confirm, release } from "../controllers/booking.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.post("/:slotId/hold", requireAuth, hold);
router.post("/:slotId/confirm", requireAuth, confirm);
router.post("/:slotId/release", requireAuth, release);
export default router;
