import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const JWT_SECRET = "testing secret key"; 

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
console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(statusCode.UNAUTHORIZED).json({
      error: errorResponse.FORBIDDEN_ACCESS,
      message: "Access token is missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (err) {
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