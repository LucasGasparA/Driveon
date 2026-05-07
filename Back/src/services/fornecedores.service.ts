import { prisma } from "../prisma/client.js";

export const FornecedoresService = {
  list: (oficinaId?: number) => prisma.fornecedor.findMany({ where: { deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) }, include: { cidade: true, oficina: true } }),
  getById: (id: number, oficinaId?: number) => prisma.fornecedor.findFirst({ where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) }, include: { cidade: true } }),
  create: (data: any) => prisma.fornecedor.create({ data }),
  update: (id: number, data: any) => prisma.fornecedor.update({ where: { id }, data }),
  remove: (id: number) => prisma.fornecedor.update({ where: { id }, data: { deleted_at: new Date() } }),
};
