import { prisma } from "../prisma/client.js";

export const AgendamentoService = {
  async list() {
    return prisma.agendamento.findMany({ where: { deleted_at: null } });
  },

  async getById(id: number) {
    return prisma.agendamento.findFirst({ where: { id, deleted_at: null } });
  },

  async listByOficina(oficina_id: number) {
    return prisma.agendamento.findMany({ where: { oficina_id, deleted_at: null } });
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
    return prisma.agendamento.update({ where: { id }, data: { deleted_at: new Date(), status: "cancelado" } });
  }
};
