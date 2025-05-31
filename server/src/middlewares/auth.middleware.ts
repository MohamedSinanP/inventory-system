import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/http.error";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

export const authenticate = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError(401, "Access token required"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);

      if (
        typeof decoded === "object" &&
        decoded !== null &&
        "userId" in decoded &&
        typeof decoded.userId === "string"
      ) {
        (req as AuthenticatedRequest).user = {
          userId: decoded.userId,
        };

        return next();
      }

      return next(new HttpError(403, "Invalid token payload"));
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return next(new HttpError(401, "Access token expired"));
      }

      return next(new HttpError(403, "Invalid access token"));
    }
  };
};
