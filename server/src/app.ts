import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import { Prisma } from "@prisma/client";

const app = express();

app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (_req, res) => {
  res.json({
    message: "MusicSense API is running",
  });
});

// Auth Routes
app.use("/auth", authRoutes);

// Upload Routes
app.use("/uploads", uploadRoutes);

// Central Error Handler
app.use((
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(400).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }
  }

  if (err.message === "Email already registered") {
    res.status(400).json({
      success: false,
      message: "Email already registered",
    });
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;