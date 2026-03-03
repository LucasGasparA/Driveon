import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import { tipo_usuario, status_usuario } from "@prisma/client";

export const UsuarioService = {
  async create(data: {
    email: string;
    senha: string;
    nome: string;
    tipo?: tipo_usuario;
    status?: status_usuario;
    oficina_id: number;
  }) {
    const { email, senha, nome, tipo = "gestoroficina", status = "ativo", oficina_id } = data;

    if (!email || !senha || !nome || !oficina_id)
      throw new Error("E-mail, senha, nome e oficina_id são obrigatórios.");

    const oficina = await prisma.oficina.findUnique({ where: { id: oficina_id } });
    if (!oficina) throw new Error("Oficina não encontrada.");

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) throw new Error("E-mail já cadastrado.");

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        nome,
        tipo,
        status,
        oficina: { connect: { id: oficina_id } },
      },
      include: {
        oficina: { select: { id: true, nome: true } },
      },
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      status: usuario.status,
      oficina: usuario.oficina,
    };
  },

  async list() {
    return prisma.usuario.findMany({
      include: { oficina: { select: { id: true, nome: true } } },
      orderBy: { id: "asc" },
    });
  },

  async getById(id: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new Error("Usuário não encontrado.");
    return usuario;
  },

  async update(id: number, data: { email?: string; senha?: string; nome?: string; tipo?: tipo_usuario; status?: status_usuario; oficina_id?: number }) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new Error("Usuário não encontrado.");
    return prisma.usuario.update({ where: { id }, data });
  },

  async delete(id: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new Error("Usuário não encontrado.");
    return prisma.usuario.delete({ where: { id } });
  },
};
