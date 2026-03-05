import { prisma } from "../prisma/client";

export const FornecedoresService = {
  list: () => prisma.fornecedor.findMany({ include: { cidade: true, oficina: true } }),
  getById: (id: number) => prisma.fornecedor.findUnique({ where: { id }, include: { cidade: true } }),
  create: (data: any) => prisma.fornecedor.create({ data }),
  update: (id: number, data: any) => prisma.fornecedor.update({ where: { id }, data }),
  remove: (id: number) => prisma.fornecedor.delete({ where: { id } }),
};
