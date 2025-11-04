import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  adminId: string;
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    (req as any).adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

