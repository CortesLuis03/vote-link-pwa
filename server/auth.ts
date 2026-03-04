import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    const user = await storage.getUserByUsername(decoded.username);
    
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
