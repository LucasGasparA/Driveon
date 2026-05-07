import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserPayload = {
  id: number;
  email: string;
  nome: string;
  tipo: string;
  oficinaId: number;
  oficina_id?: number;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const officeScopeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oficinaId = Number(req.user?.oficinaId ?? req.user?.oficina_id);
  if (!oficinaId) {
    return res.status(403).json({ message: "Token sem oficina ativa." });
  }

  req.query.oficina_id = String(oficinaId);
  req.params.oficina_id = String(oficinaId);

  if (req.body && typeof req.body === "object") {
    req.body.oficina_id = oficinaId;
    req.body.oficinaId = oficinaId;
  }

  next();
};
