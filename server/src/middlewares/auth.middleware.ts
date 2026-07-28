import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.helper.js";

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid",
    });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      success: false,
      message: "Authorization token expired or invalid",
    });
    return;
  }

  req.user = {
    id: decoded.userId,
    email: decoded.email,
  };

  next();
}
