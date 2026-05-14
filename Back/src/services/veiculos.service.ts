import { prisma } from "../prisma/client.js";

function normalizePlaca(placa: string) {
  return placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const VeiculosService = {
  list: (filters: { oficina_id: number; cliente_id?: number }) => {
    const where: any = { deleted_at: null, oficina_id: filters.oficina_id };
    if (filters?.cliente_id) where.cliente_id = filters.cliente_id;

    return prisma.veiculo.findMany({
      where,
      include: { cliente: true, oficina: true },
      orderBy: { id: "desc" },
    });
  },

  getById: (id: number, oficinaId: number) =>
    prisma.veiculo.findFirst({
      where: { id, deleted_at: null, oficina_id: oficinaId },
      include: { cliente: true, oficina: true },
    }),

  create: async (data: any) => {
    const clienteId = Number(data.cliente_id ?? data.clienteId);
    const oficinaId = Number(data.oficina_id ?? data.oficinaId);
    const placa = normalizePlaca(String(data.placa ?? ""));

    if (!clienteId || !oficinaId || !placa || !data.marca || !data.modelo) {
      throw new Error("cliente_id, oficina_id, placa, marca e modelo sao obrigatorios.");
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, oficina_id: oficinaId, deleted_at: null },
    });
    if (!cliente) throw new Error("Cliente nao encontrado nesta oficina.");

    return prisma.veiculo.create({
      data: {
        cliente_id: clienteId,
        oficina_id: oficinaId,
        placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano ? Number(data.ano) : null,
        cor: data.cor ?? null,
      },
    });
  },

  update: async (id: number, data: any, oficinaId: number) => {
    const patch: any = { ...data };
    delete patch.clienteId;
    delete patch.oficinaId;

    if (data.placa != null) patch.placa = normalizePlaca(String(data.placa));
    if (data.cliente_id != null || data.clienteId != null) {
      patch.cliente_id = Number(data.cliente_id ?? data.clienteId);
    }
    delete patch.oficina_id;
    if (data.ano != null) patch.ano = Number(data.ano);

    const existing = await prisma.veiculo.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Veiculo nao encontrado nesta oficina.");
    patch.oficina_id = oficinaId;

    if (patch.cliente_id) {
      const cliente = await prisma.cliente.findFirst({
        where: { id: patch.cliente_id, oficina_id: oficinaId, deleted_at: null },
      });
      if (!cliente) throw new Error("Cliente nao encontrado nesta oficina.");
    }

    return prisma.veiculo.update({ where: { id }, data: patch });
  },

  remove: async (id: number, oficinaId: number) => {
    const existing = await prisma.veiculo.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
    if (!existing) throw new Error("Veiculo nao encontrado nesta oficina.");

    return prisma.veiculo.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },
};
