import { prisma } from "../prisma/client.js";
import bcrypt from "bcryptjs";
// enums are provided by Prisma only under the `Prisma` namespace at runtime.
// importing them directly triggers the same error seen in
// funcionarios.service.ts; here they were previously only used for typing,
// so we convert the import to a type-only import and refer to values via
// `Prisma` when needed.
import type { tipo_usuario, status_usuario } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const UsuarioService = {
  async create(data: {
    email: string;
    senha: string;
    nome: string;
    tipo?: tipo_usuario;
    status?: status_usuario;
    oficina_id: number;
  }) {
    const { email, senha, nome, tipo = Prisma.tipo_usuario.gestoroficina, status = Prisma.status_usuario.ativo, oficina_id } = data;

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
