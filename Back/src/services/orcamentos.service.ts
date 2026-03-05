import { prisma } from "../prisma/client";

export class OrcamentoService {
  async listarTodos() {
    return prisma.orcamento.findMany({
      orderBy: { id: "desc" },
      include: {
        cliente: true,
        veiculo: true
      }
    });
  }

  async buscarPorId(id: number) {
    return prisma.orcamento.findUnique({
      where: { id },
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
  }) {
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
  

  async atualizarStatus(id: number, status: "analise" | "aprovado" | "recusado") {
    return prisma.orcamento.update({
      where: { id },
      data: { status },
    });
  }

  async atualizar(id: number, data: any) {
    return prisma.orcamento.update({
      where: { id },
      data,
    });
  }

  async excluir(id: number) {
    return prisma.orcamento.delete({ where: { id } });
  }
}
