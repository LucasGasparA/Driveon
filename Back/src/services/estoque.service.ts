import { prisma } from "../prisma/client";

export const EstoqueService = {
  list: () =>
    prisma.estoque.findMany({
      orderBy: { id: "desc" },
      include: { oficina: true },
    }),

  getById: (id: number) =>
    prisma.estoque.findUnique({
      where: { id },
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

  update: async (id: number, data: any) => {
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

  delete: (id: number) => prisma.estoque.delete({ where: { id } }),

  remove: (id: number) => prisma.estoque.delete({ where: { id } }),
};
