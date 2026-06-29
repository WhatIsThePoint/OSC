import { Router } from "express";
import {
  createVenue,
  listVenues,
  getVenue,
  updateVenue,
  deleteVenue,
} from "../controllers/venue.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireOwnership } from "../middlewares/ownership.js";

const router = Router();
router.get("/", listVenues);
router.get("/:id", getVenue);
router.post("/", requireAuth, createVenue);
router.patch("/:id", requireAuth, requireOwnership, updateVenue);
router.delete("/:id", requireAuth, requireOwnership, deleteVenue);
export default router;
