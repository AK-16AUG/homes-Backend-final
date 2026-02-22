import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";
import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    User_Name: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[AuthMiddleware] Access token is missing or malformed header:", authHeader);
    return res.status(statusCode.UNAUTHORIZED).json({
      error: errorResponse.FORBIDDEN_ACCESS,
      message: "Access token is missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const JWT_SECRET = process.env.SECRET_KEY;
    if (!JWT_SECRET) {
      console.error("[AuthMiddleware] SECRET_KEY is not defined in environment variables");
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: "Internal server configuration error",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      console.warn("[AuthMiddleware] Token expired at:", err.expiredAt);
    } else {
      console.error("[AuthMiddleware] JWT Verification Failed:", err.message);
    }

    return res.status(statusCode.UNAUTHORIZED).json({
      error: errorResponse.FORBIDDEN_ACCESS,
      message: "Invalid or expired token",
    });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(statusCode.FORBIDDEN).json({
        error: errorResponse.FORBIDDEN_ACCESS,
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
}