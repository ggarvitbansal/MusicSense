import jwt from "jsonwebtoken";
import type { SignOptions, JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

if (!JWT_SECRET && NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is missing in production environment!");
}

const activeSecret = JWT_SECRET || "supersafesecretfordevelopmentonly12345!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  const options = {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign({ userId: payload.userId, email: payload.email }, activeSecret, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, activeSecret) as JwtPayload;
    if (
      decoded &&
      typeof decoded === "object" &&
      typeof decoded.userId === "string" &&
      typeof decoded.email === "string"
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}
