import { prisma } from "../prisma/client";

export const VeiculosService = {
  list: () => prisma.veiculo.findMany({ include: { cliente: true } }),
  getById: (id: number) => prisma.veiculo.findUnique({ where: { id }, include: { cliente: true } }),
  create: (data: any) => prisma.veiculo.create({ data }),
  update: (id: number, data: any) => prisma.veiculo.update({ where: { id }, data }),
  remove: (id: number) => prisma.veiculo.delete({ where: { id } }),
};
