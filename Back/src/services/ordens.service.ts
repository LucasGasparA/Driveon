import { prisma } from "../prisma/client";

export const OrdensService = {
  list: async () => {
    return prisma.ordem_servico.findMany({
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

  getById: async (id: number) => {
    const os = await prisma.ordem_servico.findUnique({
      where: { id },
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

    if (!cliente_id || !veiculo_id || !funcionario_id) {
      throw new Error("Campos obrigatórios não informados.");
    }

    return prisma.ordem_servico.create({
      data: {
        oficina_id: oficina_id ?? 1,
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

  update: async (id: number, data: any) => {
    const { itens, ...rest } = data;

    const osAtualizada = await prisma.ordem_servico.update({
      where: { id },
      data: {
        ...rest,
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

  delete: async (id: number) => {
    try {
      await prisma.item_ordem_servico.deleteMany({
        where: { ordem_servico_id: id },
      });

      return await prisma.ordem_servico.delete({
        where: { id },
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
