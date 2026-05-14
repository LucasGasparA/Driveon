import { prisma } from "../prisma/client.js";

export const PecasService = {
  list: async (oficinaId: number) => {
    return prisma.peca.findMany({
      where: { deleted_at: null, oficina_id: oficinaId },
      orderBy: { id: "desc" },
    });
  },

  getById: async (id: number, oficinaId: number) => {
    return prisma.peca.findFirst({
      where: { id, deleted_at: null, oficina_id: oficinaId },
    });
  },

  create: async (data: any) => {
    return prisma.peca.create({
      data,
    });
  },

  update: async (id: number, data: any, oficinaId: number) => {
    const existing = await prisma.peca.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Peca nao encontrada nesta oficina.");
    const { oficina_id, oficinaId: _oficinaId, ...patch } = data;

    return prisma.peca.update({
      where: { id },
      data: patch,
    });
  },

  delete: async (id: number, oficinaId: number) => {
    const existing = await prisma.peca.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Peca nao encontrada nesta oficina.");

    return prisma.peca.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },
};
