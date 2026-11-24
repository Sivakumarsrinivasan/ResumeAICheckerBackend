import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../generated/prisma/client";

export interface AuthUser {
  id: number;
  email?: string;
  name?: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization token" });
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.SECRET ?? process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("JWT secret environment variable is not configured"));
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      id?: number;
      userId?: number;
      email?: string;
      name?: string;
      role?: Role;
    };

    const userId = decoded.id ?? decoded.userId;
    if (!userId || !decoded.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: Number(userId),
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}

export function authorizeRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    return next();
  };
}