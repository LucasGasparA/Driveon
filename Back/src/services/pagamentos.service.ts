import { prisma } from "../prisma/client.js";

type PagamentoInput = {
  cliente_id?: number | null;
  oficina_id: number;
  ordem_servico_id?: number | null;
  fornecedor_id?: number | null;
  tipo: "pagar" | "receber";
  metodo?: "dinheiro" | "pix" | "cartao" | "boleto" | "transferencia";
  valor: number;
  status?: "pendente" | "pago" | "cancelado";
  data_vencimento: Date | string;
  data_pagamento?: Date | string | null;
  categoria?: string | null;
  descricao?: string | null;
  observacao?: string | null;
};

function validatePagamento(data: Partial<PagamentoInput>) {
  if (!data.oficina_id || !data.valor || !data.tipo) {
    throw new Error("oficina_id, valor e tipo sao obrigatorios.");
  }

  if (data.tipo === "receber" && !data.cliente_id && !data.ordem_servico_id) {
    throw new Error("Contas a receber precisam de cliente_id ou ordem_servico_id.");
  }
}

export const PagamentosService = {
  async list(oficina_id: number, cliente_id?: number) {
    if (!oficina_id) throw new Error("oficina_id e obrigatorio.");

    const where: any = { oficina_id, deleted_at: null };
    if (cliente_id) where.cliente_id = cliente_id;

    return await prisma.pagamento.findMany({
      where,
      orderBy: { data_vencimento: "desc" },
      include: {
        cliente: { select: { id: true, nome: true, email: true } },
        fornecedor: { select: { id: true, nome: true } },
        ordem_servico: { select: { id: true, status: true } },
      },
    });
  },

  async listByCliente(cliente_id: number) {
    if (!cliente_id) throw new Error("cliente_id e obrigatorio.");

    return await prisma.pagamento.findMany({
      where: { cliente_id, deleted_at: null },
      orderBy: { data_vencimento: "desc" },
      include: {
        oficina: { select: { id: true, nome: true } },
        fornecedor: { select: { id: true, nome: true } },
      },
    });
  },

  async getById(id: number, oficinaId?: number) {
    if (!id) throw new Error("ID do pagamento e obrigatorio.");

    const pagamento = await prisma.pagamento.findFirst({
      where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
      include: {
        cliente: true,
        oficina: true,
        fornecedor: true,
        ordem_servico: true,
      },
    });

    if (!pagamento) throw new Error("Pagamento nao encontrado.");
    return pagamento;
  },

  async create(data: PagamentoInput) {
    validatePagamento(data);

    return await prisma.pagamento.create({
      data: {
        cliente_id: data.cliente_id ?? null,
        oficina_id: data.oficina_id,
        ordem_servico_id: data.ordem_servico_id ?? null,
        fornecedor_id: data.fornecedor_id ?? null,
        tipo: data.tipo,
        valor: data.valor,
        status: data.status ?? "pendente",
        data_vencimento: new Date(data.data_vencimento),
        data_pagamento: data.data_pagamento ? new Date(data.data_pagamento) : null,
        metodo: data.metodo ?? "pix",
        categoria: data.categoria ?? null,
        descricao: data.descricao ?? null,
        observacao: data.observacao ?? null,
      },
    });
  },

  async update(id: number, data: Partial<PagamentoInput>, oficinaId?: number) {
    if (!id) throw new Error("ID do pagamento e obrigatorio.");

    const existing = await prisma.pagamento.findFirst({
      where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
    });
    if (!existing) throw new Error("Pagamento nao encontrado.");

    const merged = { ...existing, ...data };
    validatePagamento({
      oficina_id: oficinaId ?? merged.oficina_id,
      valor: Number(merged.valor),
      tipo: merged.tipo,
      cliente_id: merged.cliente_id,
      ordem_servico_id: merged.ordem_servico_id,
    });

    return await prisma.pagamento.update({
      where: { id },
      data: {
        ...data,
        oficina_id: oficinaId ?? data.oficina_id,
        cliente_id: data.cliente_id === undefined ? existing.cliente_id : data.cliente_id,
        fornecedor_id: data.fornecedor_id === undefined ? existing.fornecedor_id : data.fornecedor_id,
        ordem_servico_id: data.ordem_servico_id === undefined ? existing.ordem_servico_id : data.ordem_servico_id,
        data_vencimento: data.data_vencimento
          ? new Date(data.data_vencimento)
          : existing.data_vencimento,
        data_pagamento: data.data_pagamento
          ? new Date(data.data_pagamento)
          : existing.data_pagamento,
      },
    });
  },

  async delete(id: number, oficinaId?: number) {
    if (!id) throw new Error("ID do pagamento e obrigatorio.");

    const existing = await prisma.pagamento.findFirst({ where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) } });
    if (!existing) throw new Error("Pagamento nao encontrado.");

    await prisma.pagamento.update({
      where: { id },
      data: { deleted_at: new Date(), status: "cancelado" },
    });
    return { message: "Pagamento cancelado com sucesso." };
  },

  async extrato(oficina_id: number, from?: string, to?: string) {
    if (!oficina_id) throw new Error("oficina_id e obrigatorio.");

    const where: any = { oficina_id, deleted_at: null };
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
