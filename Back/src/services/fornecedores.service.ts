import { prisma } from "../prisma/client.js";

export const FornecedoresService = {
  list: (oficinaId: number) => prisma.fornecedor.findMany({ where: { deleted_at: null, oficina_id: oficinaId }, include: { cidade: true, oficina: true } }),
  getById: (id: number, oficinaId: number) => prisma.fornecedor.findFirst({ where: { id, deleted_at: null, oficina_id: oficinaId }, include: { cidade: true } }),
  create: (data: any) => prisma.fornecedor.create({ data }),
  update: async (id: number, data: any, oficinaId: number) => {
    const existing = await prisma.fornecedor.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Fornecedor nao encontrado nesta oficina.");
    const { oficina_id, oficinaId: _oficinaId, ...patch } = data;
    return prisma.fornecedor.update({ where: { id }, data: patch });
  },
  remove: async (id: number, oficinaId: number) => {
    const existing = await prisma.fornecedor.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Fornecedor nao encontrado nesta oficina.");
    return prisma.fornecedor.update({ where: { id }, data: { deleted_at: new Date() } });
  },
};
