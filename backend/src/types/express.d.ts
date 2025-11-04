import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

