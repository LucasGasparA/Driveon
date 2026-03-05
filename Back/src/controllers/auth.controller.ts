import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

export async function login(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const senha = String(req.body?.senha ?? "");

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    // Confere se existe a secret antes de gerar token
    if (!process.env.JWT_SECRET) {
      console.error("❌ ERRO FATAL: JWT_SECRET não configurado no ambiente.");
      return res.status(500).json({
        message: "Erro interno de configuração. Contate o administrador.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { oficina: true },
    });

    // Mesmo que o usuário não exista, calcula hash para evitar ataque por tempo
    const senhaHash = usuario?.senha ?? "$2b$10$invalidsaltsimulatingcomparexxxxxxx";
    const senhaValida = await bcrypt.compare(senha, senhaHash);

    if (!usuario || !senhaValida) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    // Payload seguro — apenas o necessário
    const usuarioPayload = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
      oficinaId: usuario.oficina_id ?? null,
    };

    const token = jwt.sign(usuarioPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      usuario: usuarioPayload,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro interno ao autenticar." });
  }
}
