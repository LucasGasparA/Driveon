import { prisma } from "../prisma/client";

export const ServicosService = {
  list: () => prisma.servico.findMany(),
  
  getById: (id: number) =>
    prisma.servico.findUnique({
      where: { id },
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
    prisma.servico.delete({
      where: { id },
    }),
};
