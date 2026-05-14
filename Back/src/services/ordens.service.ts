import { prisma } from "../prisma/client.js";

async function validateOrdemRelations(data: any, oficinaId: number) {
  const [cliente, veiculo, funcionario] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: Number(data.cliente_id), oficina_id: oficinaId, deleted_at: null } }),
    prisma.veiculo.findFirst({ where: { id: Number(data.veiculo_id), oficina_id: oficinaId, deleted_at: null } }),
    prisma.funcionario.findFirst({ where: { id: Number(data.funcionario_id), oficina_id: oficinaId, deleted_at: null } }),
  ]);

  if (!cliente) throw new Error("Cliente nao encontrado nesta oficina.");
  if (!veiculo) throw new Error("Veiculo nao encontrado nesta oficina.");
  if (!funcionario) throw new Error("Funcionario nao encontrado nesta oficina.");

  for (const item of data.itens ?? []) {
    if ((item.tipo_item ?? item.tipo) === "servico" && item.servico_id) {
      const servico = await prisma.servico.findFirst({
        where: { id: Number(item.servico_id), oficina_id: oficinaId, deleted_at: null },
      });
      if (!servico) throw new Error("Servico nao encontrado nesta oficina.");
    }
    if ((item.tipo_item ?? item.tipo) === "peca" && item.peca_id) {
      const peca = await prisma.peca.findFirst({
        where: { id: Number(item.peca_id), oficina_id: oficinaId, deleted_at: null },
      });
      if (!peca) throw new Error("Peca nao encontrada nesta oficina.");
    }
  }
}

export const OrdensService = {
  list: async (oficinaId: number) => {
    return prisma.ordem_servico.findMany({
      where: { deleted_at: null, oficina_id: oficinaId },
      orderBy: { created_at: "desc" },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: {
          include: {
            servico: true,
            peca: true,
          },
        },
      },
    });
  },

  getById: async (id: number, oficinaId: number) => {
    const os = await prisma.ordem_servico.findFirst({
      where: { id, deleted_at: null, oficina_id: oficinaId },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: {
          include: {
            servico: true,
            peca: true,
          },
        },
      },
    });

    if (!os) throw new Error("Ordem de serviço não encontrada.");
    return os;
  },

  create: async (data: any) => {
    const {
      oficina_id,
      cliente_id,
      veiculo_id,
      funcionario_id,
      observacoes,
      valor_total,
      itens,
    } = data;

    if (!oficina_id || !cliente_id || !veiculo_id || !funcionario_id) {
      throw new Error("Campos obrigatórios não informados.");
    }
    await validateOrdemRelations({ cliente_id, veiculo_id, funcionario_id, itens }, oficina_id);

    return prisma.ordem_servico.create({
      data: {
        oficina_id,
        cliente_id,
        veiculo_id,
        funcionario_id,
        observacoes: observacoes ?? "",
        status: "aberta",
        valor_total: valor_total ?? 0,
        itens: {
          create: (itens ?? []).map((i: any) => ({
            tipo_item: i.tipo_item ?? i.tipo ?? "servico",
            servico_id:
              (i.tipo_item ?? i.tipo) === "servico"
                ? i.servico_id ?? null
                : null,
            peca_id:
              (i.tipo_item ?? i.tipo) === "peca" ? i.peca_id ?? null : null,
            quantidade: i.quantidade ?? 1,
            preco_unitario: i.preco_unitario ?? i.preco ?? 0,
            subtotal: i.subtotal ?? 0,
          })),
        },
      },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: {
          include: { servico: true, peca: true },
        },
      },
    });
  },

  update: async (id: number, data: any, oficinaId: number) => {
    const { itens, ...rest } = data;
    const existing = await prisma.ordem_servico.findFirst({
      where: { id, oficina_id: oficinaId, deleted_at: null },
    });
    if (!existing) throw new Error("Ordem de servico nao encontrada nesta oficina.");
    delete rest.oficina_id;
    delete rest.oficinaId;
    await validateOrdemRelations(
      {
        cliente_id: rest.cliente_id ?? existing.cliente_id,
        veiculo_id: rest.veiculo_id ?? existing.veiculo_id,
        funcionario_id: rest.funcionario_id ?? existing.funcionario_id,
        itens,
      },
      oficinaId
    );

    const osAtualizada = await prisma.ordem_servico.update({
      where: { id },
      data: {
        ...rest,
        oficina_id: oficinaId,
        updated_at: new Date(),
      },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: { include: { servico: true, peca: true } },
      },
    });

    if (itens && Array.isArray(itens)) {
      await prisma.item_ordem_servico.deleteMany({
        where: { ordem_servico_id: id },
      });

      await prisma.item_ordem_servico.createMany({
        data: itens.map((i: any) => ({
          ordem_servico_id: id,
          tipo_item: i.tipo_item ?? i.tipo ?? "servico",
          servico_id:
            (i.tipo_item ?? i.tipo) === "servico" ? i.servico_id ?? null : null,
          peca_id:
            (i.tipo_item ?? i.tipo) === "peca" ? i.peca_id ?? null : null,
          quantidade: i.quantidade ?? 1,
          preco_unitario: i.preco_unitario ?? i.preco ?? 0,
          subtotal: i.subtotal ?? 0,
        })),
      });
    }

    return prisma.ordem_servico.findUnique({
      where: { id },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: { include: { servico: true, peca: true } },
      },
    });
  },

  delete: async (id: number, oficinaId: number) => {
    try {
      const existing = await prisma.ordem_servico.findFirst({ where: { id, oficina_id: oficinaId, deleted_at: null } });
      if (!existing) throw new Error("Ordem de servico nao encontrada nesta oficina.");
      await prisma.item_ordem_servico.updateMany({
        where: { ordem_servico_id: id, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      return await prisma.ordem_servico.update({
        where: { id },
        data: { deleted_at: new Date(), status: "cancelada" },
      });
    } catch (err: any) {
      console.error("Erro ao excluir OS:", err);
      if (err.code === "P2003") {
        throw new Error(
          "Não é possível excluir esta OS porque há registros vinculados."
        );
      }
      throw err;
    }
  },
};
