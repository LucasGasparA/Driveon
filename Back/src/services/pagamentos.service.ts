import { prisma } from "../prisma/client";

type PagamentoInput = {
  cliente_id: number;
  oficina_id: number;
  tipo: "pagar" | "receber";
  metodo?: "dinheiro" | "pix" | "cartao" | "boleto" | "transferencia";
  valor: number;
  status?: "pendente" | "pago" | "cancelado";
  data_vencimento: Date | string;
  data_pagamento?: Date | string | null;
  observacao?: string | null;
};

export const PagamentosService = {
  async list(oficina_id: number) {
    if (!oficina_id) throw new Error("oficina_id é obrigatório.");

    return await prisma.pagamento.findMany({
      where: { oficina_id },
      orderBy: { data_vencimento: "desc" },
      include: {
        cliente: { select: { id: true, nome: true, email: true } },
      },
    });
  },

  async listByCliente(cliente_id: number) {
    if (!cliente_id) throw new Error("cliente_id é obrigatório.");

    return await prisma.pagamento.findMany({
      where: { cliente_id },
      orderBy: { data_vencimento: "desc" },
      include: {
        oficina: { select: { id: true, nome: true } },
      },
    });
  },

  async getById(id: number) {
    if (!id) throw new Error("ID do pagamento é obrigatório.");

    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        oficina: true,
      },
    });

    if (!pagamento) throw new Error("Pagamento não encontrado.");
    return pagamento;
  },

  async create(data: PagamentoInput) {
    if (!data.cliente_id || !data.oficina_id || !data.valor || !data.tipo)
      throw new Error("Campos obrigatórios ausentes.");

    return await prisma.pagamento.create({
      data: {
        cliente_id: data.cliente_id,
        oficina_id: data.oficina_id,
        tipo: data.tipo,
        valor: data.valor,
        status: data.status ?? "pendente",
        data_vencimento: new Date(data.data_vencimento),
        data_pagamento: data.data_pagamento
          ? new Date(data.data_pagamento)
          : null,
        metodo: data.metodo ?? "pix",
        observacao: data.observacao ?? null,
      },
    });
  },

  // 🔹 Atualiza um pagamento existente
  async update(id: number, data: Partial<PagamentoInput>) {
    if (!id) throw new Error("ID do pagamento é obrigatório.");

    const existing = await prisma.pagamento.findUnique({ where: { id } });
    if (!existing) throw new Error("Pagamento não encontrado.");

    return await prisma.pagamento.update({
      where: { id },
      data: {
        ...data,
        data_vencimento: data.data_vencimento
          ? new Date(data.data_vencimento)
          : existing.data_vencimento,
        data_pagamento: data.data_pagamento
          ? new Date(data.data_pagamento)
          : existing.data_pagamento,
      },
    });
  },

  // 🔹 Exclui um pagamento
  async delete(id: number) {
    if (!id) throw new Error("ID do pagamento é obrigatório.");

    const existing = await prisma.pagamento.findUnique({ where: { id } });
    if (!existing) throw new Error("Pagamento não encontrado.");

    await prisma.pagamento.delete({ where: { id } });
    return { message: "Pagamento excluído com sucesso." };
  },

  // 🔹 Gera extrato de uma oficina (entrada/saída)
  async extrato(oficina_id: number, from?: string, to?: string) {
    if (!oficina_id) throw new Error("oficina_id é obrigatório.");

    const where: any = { oficina_id };
    if (from && to) {
      where.data_vencimento = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const pagamentos = await prisma.pagamento.findMany({
      where,
      orderBy: { data_vencimento: "desc" },
    });

    const totalRecebido = pagamentos
      .filter((p) => p.tipo === "receber" && p.status === "pago")
      .reduce((sum, p) => sum + Number(p.valor), 0);

    const totalPagar = pagamentos
      .filter((p) => p.tipo === "pagar" && p.status !== "pago")
      .reduce((sum, p) => sum + Number(p.valor), 0);

    return {
      totalRecebido,
      totalPagar,
      saldo: totalRecebido - totalPagar,
      pagamentos,
    };
  },
};
