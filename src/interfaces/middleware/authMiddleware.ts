import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../../infrastructure/logging/logger";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Authentication failed: No token provided");
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as { userId: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn("Authentication failed: Invalid token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Authorization failed: User ${req.user.userId} with role ${req.user.role} attempted to access restricted route`
      );
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
