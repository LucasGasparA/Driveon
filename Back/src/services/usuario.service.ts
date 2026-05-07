import { prisma } from "../prisma/client.js";
import bcrypt from "bcryptjs";
import type { tipo_usuario, status_usuario } from "@prisma/client";

export const UsuarioService = {
  async create(data: {
    email: string;
    senha: string;
    nome: string;
    tipo?: tipo_usuario;
    status?: status_usuario;
    oficina_id: number;
  }) {
    const email = data.email?.trim().toLowerCase();
    const { senha, nome, tipo = "gestoroficina", status = "ativo", oficina_id } = data;

    if (!email || !senha || !nome || !oficina_id) {
      throw new Error("E-mail, senha, nome e oficina_id sao obrigatorios.");
    }

    const oficina = await prisma.oficina.findUnique({ where: { id: oficina_id } });
    if (!oficina) throw new Error("Oficina nao encontrada.");

    const senhaHash = await bcrypt.hash(senha, 10);

    const existing = await prisma.usuario.findUnique({ where: { email } });
    const usuario = existing
      ? await prisma.usuario.update({
          where: { id: existing.id },
          data: { nome, status, deleted_at: null },
          include: {
            acessos: { include: { oficina: { select: { id: true, nome: true } } } },
          },
        })
      : await prisma.usuario.create({
          data: {
            email,
            senha: senhaHash,
            nome,
            tipo,
            status,
          },
          include: {
            acessos: { include: { oficina: { select: { id: true, nome: true } } } },
          },
        });

    await prisma.usuario_oficina.upsert({
      where: { usuario_id_oficina_id: { usuario_id: usuario.id, oficina_id } },
      update: { perfil: tipo, status, deleted_at: null },
      create: {
        usuario_id: usuario.id,
        oficina_id,
        perfil: tipo,
        status,
      },
    });

    const usuarioComAcessos = await prisma.usuario.findUniqueOrThrow({
      where: { id: usuario.id },
      include: {
        acessos: { include: { oficina: { select: { id: true, nome: true } } } },
      },
    });

    return {
      id: usuarioComAcessos.id,
      nome: usuarioComAcessos.nome,
      email: usuarioComAcessos.email,
      tipo: usuarioComAcessos.tipo,
      status: usuarioComAcessos.status,
      oficinas: usuarioComAcessos.acessos.map((acesso) => ({
        id: acesso.oficina_id,
        nome: acesso.oficina.nome,
        perfil: acesso.perfil,
        status: acesso.status,
      })),
    };
  },

  async list() {
    return prisma.usuario.findMany({
      where: { deleted_at: null },
      include: {
        acessos: {
          where: { deleted_at: null },
          include: { oficina: { select: { id: true, nome: true } } },
        },
      },
      orderBy: { id: "asc" },
    });
  },

  async getById(id: number) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, deleted_at: null },
      include: {
        acessos: {
          where: { deleted_at: null },
          include: { oficina: { select: { id: true, nome: true } } },
        },
      },
    });
    if (!usuario) throw new Error("Usuario nao encontrado.");
    return usuario;
  },

  async update(id: number, data: { email?: string; senha?: string; nome?: string; tipo?: tipo_usuario; status?: status_usuario; oficina_id?: number }) {
    const usuario = await prisma.usuario.findFirst({ where: { id, deleted_at: null } });
    if (!usuario) throw new Error("Usuario nao encontrado.");

    const patch: any = { ...data };
    delete patch.oficina_id;
    if (data.email) patch.email = data.email.trim().toLowerCase();
    if (data.senha) patch.senha = await bcrypt.hash(data.senha, 10);

    return prisma.usuario.update({ where: { id }, data: patch });
  },

  async delete(id: number) {
    const usuario = await prisma.usuario.findFirst({ where: { id, deleted_at: null } });
    if (!usuario) throw new Error("Usuario nao encontrado.");
    return prisma.usuario.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: "inativo",
        acessos: {
          updateMany: {
            where: { deleted_at: null },
            data: { deleted_at: new Date(), status: "inativo" },
          },
        },
      },
    });
  },
};
