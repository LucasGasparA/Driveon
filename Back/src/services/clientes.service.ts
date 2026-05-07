import { prisma } from "../prisma/client.js";

type ClienteInput = {
  nome: string;
  email?: string;
  telefone?: string;
  observacoes?: string;
  oficina_id?: number;
};

export const ClienteService = {

  async listar(oficinaId?: number, search: string = "") {
    const where: any = { deleted_at: null };

    if (oficinaId) {
      where.oficina_id = oficinaId;
    }

    if (search.trim().length > 0) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.cliente.findMany({
      where,
      orderBy: { nome: "asc" },
      include: {
        veiculos: true,
        ordens: true,
        pagamentos: true,
      },
    });
  },

  async getDetalhes(id: number, oficina_id?: number) {
    const where: any = { id, deleted_at: null };
    if (oficina_id) where.oficina_id = oficina_id;

    const cliente = await prisma.cliente.findFirst({
      where,
      include: {
        veiculos: true,
        ordens: {
          orderBy: { created_at: "desc" },
          include: { veiculo: true, funcionario: true },
        },
        pagamentos: {
          orderBy: { data_vencimento: "desc" },
        },
      },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    return cliente;
  },

  async criar(data: ClienteInput) {
    if (!data.nome) {
      throw new Error("Nome é obrigatório.");
    }

    if (!data.oficina_id) {
      throw new Error("oficina_id e obrigatorio.");
    }

    return await prisma.cliente.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        observacao: data.observacoes,
        oficina_id: data.oficina_id,
      },
    });
  },

  async atualizar(id: number, data: ClienteInput, oficina_id?: number) {
    const cliente = await prisma.cliente.findFirst({ where: { id, deleted_at: null, ...(oficina_id ? { oficina_id } : {}) } });
    if (!cliente) throw new Error("Cliente não encontrado.");

    return prisma.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        observacao: data.observacoes,
      },
    });
  },

  async deletar(id: number, oficina_id?: number) {
    const where: any = { id, deleted_at: null };
    if (oficina_id) where.oficina_id = oficina_id;

    const cliente = await prisma.cliente.findFirst({ where });
    if (!cliente) throw new Error("Cliente não encontrado.");

    await prisma.cliente.update({ where: { id }, data: { deleted_at: new Date(), status: "inativo" } });
  },

  listarVeiculosDoCliente(clienteId: number, oficina_id?: number) {
    return prisma.veiculo.findMany({
      where: { cliente_id: clienteId, deleted_at: null, ...(oficina_id ? { oficina_id } : {}) },
      orderBy: { id: "desc" }
    });
  }
};
