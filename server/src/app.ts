import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

import { Prisma } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads/files", express.static(path.join(__dirname, "../uploads")));


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

// Analysis Routes
app.use("/analysis", analysisRoutes);

// Settings Routes
app.use("/settings", settingsRoutes);


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