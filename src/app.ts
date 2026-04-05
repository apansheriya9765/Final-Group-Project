import express from "express";
import cors from "cors";
import authRoutes from "./interfaces/routes/authRoutes";
import spaceRoutes from "./interfaces/routes/spaceRoutes";
import bookingRoutes from "./interfaces/routes/bookingRoutes";
import { errorHandler } from "./interfaces/middleware/errorHandler";
import { logger } from "./infrastructure/logging/logger";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware with duration tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

export default app;
