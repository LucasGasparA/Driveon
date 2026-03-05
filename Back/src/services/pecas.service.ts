import { prisma } from "../prisma/client";

export const PecasService = {
  list: async () => {
    return prisma.peca.findMany({
      orderBy: { id: "desc" },
    });
  },

  getById: async (id: number) => {
    return prisma.peca.findUnique({
      where: { id },
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
    return prisma.peca.delete({
      where: { id },
    });
  },
};
