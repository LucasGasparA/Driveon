import { prisma } from "../prisma/client";

export const AgendamentoService = {
  async list() {
    return prisma.agendamento.findMany();
  },

  async getById(id: number) {
    return prisma.agendamento.findUnique({ where: { id } });
  },

  async listByOficina(oficina_id: number) {
    return prisma.agendamento.findMany({ where: { oficina_id } });
  },

  async create(data: any) {
    return prisma.agendamento.create({ data });
  },

  async update(id: number, data: any) {
    return prisma.agendamento.update({
      where: { id },
      data,
    });
  },

  async remove(id: number) {
    return prisma.agendamento.delete({ where: { id } });
  }
};
