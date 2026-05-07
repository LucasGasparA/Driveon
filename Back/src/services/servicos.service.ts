import { prisma } from "../prisma/client.js";

export const ServicosService = {
  list: (oficinaId?: number) => prisma.servico.findMany({ where: { deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) } }),
  
  getById: (id: number, oficinaId?: number) =>
    prisma.servico.findFirst({
      where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
    }),

  create: (data: any) =>
    prisma.servico.create({
      data: {
        oficina_id: data.oficina_id,
        nome: data.nome,
        descricao: data.descricao ?? null,
        preco: data.preco,
      },
    }),

  update: (id: number, data: any) =>
    prisma.servico.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        preco: data.preco,
      },
    }),

  remove: (id: number) =>
    prisma.servico.update({
      where: { id },
      data: { deleted_at: new Date() },
    }),
};
