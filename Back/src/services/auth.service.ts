import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "driveon_secret";

export const AuthService = {
  async login(email: string, senha: string) {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) throw new Error("E-mail ou senha inválidos");

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) throw new Error("E-mail ou senha inválidos");

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
      usuario: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
      },
    };
  },
};
