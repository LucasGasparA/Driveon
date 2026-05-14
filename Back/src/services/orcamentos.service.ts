import { prisma } from "../prisma/client.js";

export class OrcamentoService {
  async listarTodos(oficinaId: number) {
    return prisma.orcamento.findMany({
      where: { deleted_at: null, cliente: { oficina_id: oficinaId } },
      orderBy: { id: "desc" },
      include: {
        cliente: true,
        veiculo: true
      }
    });
  }

  async buscarPorId(id: number, oficinaId: number) {
    return prisma.orcamento.findFirst({
      where: { id, deleted_at: null, cliente: { oficina_id: oficinaId } },
      include: {
        cliente: true,
        veiculo: true
      }
    });
  }

  async criar(data: {
    clienteId: number;
    veiculoId: number;
    descricao: string;
    valor: number;
    data: string;
	    oficinaId: number;
	  }) {
    const cliente = await prisma.cliente.findFirst({
      where: { id: data.clienteId, oficina_id: data.oficinaId, deleted_at: null },
    });
    if (!cliente) throw new Error("Cliente nao encontrado nesta oficina.");
    const veiculo = await prisma.veiculo.findFirst({
      where: { id: data.veiculoId, oficina_id: data.oficinaId, deleted_at: null },
    });
    if (!veiculo) throw new Error("Veiculo nao encontrado nesta oficina.");

    return prisma.orcamento.create({
      data: {
        descricao: data.descricao,
        valor: Number(data.valor),
        data: new Date(data.data),
  
        // CAMPOS CERTOS DO SCHEMA
        cliente_id: data.clienteId,
        veiculo_id: data.veiculoId,
      },
      include: {
        cliente: true,
        veiculo: true
      }
    });
  }
  

  async atualizarStatus(id: number, status: "analise" | "aprovado" | "recusado", oficinaId: number) {
    const existing = await this.buscarPorId(id, oficinaId);
    if (!existing) throw new Error("Orcamento nao encontrado nesta oficina.");
    return prisma.orcamento.update({
      where: { id },
      data: { status },
    });
  }

  async atualizar(id: number, data: any, oficinaId: number) {
    const existing = await this.buscarPorId(id, oficinaId);
    if (!existing) throw new Error("Orcamento nao encontrado nesta oficina.");
    const clienteId = data.cliente_id ?? data.clienteId;
    const veiculoId = data.veiculo_id ?? data.veiculoId;

    if (clienteId != null) {
      const cliente = await prisma.cliente.findFirst({
        where: { id: Number(clienteId), oficina_id: oficinaId, deleted_at: null },
      });
      if (!cliente) throw new Error("Cliente nao encontrado nesta oficina.");
    }
    if (veiculoId != null) {
      const veiculo = await prisma.veiculo.findFirst({
        where: { id: Number(veiculoId), oficina_id: oficinaId, deleted_at: null },
      });
      if (!veiculo) throw new Error("Veiculo nao encontrado nesta oficina.");
    }
    const { clienteId: _clienteId, veiculoId: _veiculoId, oficinaId: _oficinaId, ...patch } = data;

    return prisma.orcamento.update({
      where: { id },
      data: patch,
    });
  }

  async excluir(id: number, oficinaId: number) {
    const existing = await this.buscarPorId(id, oficinaId);
    if (!existing) throw new Error("Orcamento nao encontrado nesta oficina.");
    return prisma.orcamento.update({ where: { id }, data: { deleted_at: new Date(), status: "recusado" } });
  }
}
