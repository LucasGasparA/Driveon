import { prisma } from "../prisma/client.js";

export const EstoqueService = {
  list: (oficinaId: number) =>
    prisma.estoque.findMany({
      where: { deleted_at: null, oficina_id: oficinaId },
      orderBy: { id: "desc" },
      include: { oficina: true },
    }),

  getById: (id: number, oficinaId: number) =>
    prisma.estoque.findFirst({
      where: { id, deleted_at: null, oficina_id: oficinaId },
      include: { oficina: true },
    }),

  create: async (data: any) => {
    const oficinaId = Number(data.oficinaId ?? data.oficina_id);
    if (!oficinaId) {
      throw new Error("oficinaId é obrigatório e deve ser válido.");
    }

    return prisma.estoque.create({
      data: {
        nome: data.nome,
        descricao: data.descricao ?? "",
        preco_custo: Number(data.preco_custo) || 0,
        preco_venda: Number(data.preco_venda) || 0,
        estoque_qtd: Number(data.estoque_qtd ?? data.estoque) || 0,
        oficina: { connect: { id: oficinaId } },
      },
    });
  },

  update: async (id: number, data: any, oficinaId: number) => {
    const existing = await prisma.estoque.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Item de estoque nao encontrado nesta oficina.");

    return prisma.estoque.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco_custo: Number(data.preco_custo) || 0,
        preco_venda: Number(data.preco_venda) || 0,
        estoque_qtd: Number(data.estoque_qtd ?? data.estoque) || 0,
      },
    });
  },

  delete: async (id: number, oficinaId: number) => {
    const existing = await prisma.estoque.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Item de estoque nao encontrado nesta oficina.");
    return prisma.estoque.update({ where: { id }, data: { deleted_at: new Date() } });
  },

  remove: async (id: number, oficinaId: number) => {
    const existing = await prisma.estoque.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Item de estoque nao encontrado nesta oficina.");
    return prisma.estoque.update({ where: { id }, data: { deleted_at: new Date() } });
  },
};
