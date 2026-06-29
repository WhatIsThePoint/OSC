import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import venueRoutes from "./routes/venue.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";

export const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/venues", availabilityRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));
