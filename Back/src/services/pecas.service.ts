import { prisma } from "../prisma/client.js";

export const PecasService = {
  list: async (oficinaId?: number) => {
    return prisma.peca.findMany({
      where: { deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
      orderBy: { id: "desc" },
    });
  },

  getById: async (id: number, oficinaId?: number) => {
    return prisma.peca.findFirst({
      where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
    });
  },

  create: async (data: any) => {
    return prisma.peca.create({
      data,
    });
  },

  update: async (id: number, data: any) => {
    return prisma.peca.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.peca.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },
};
