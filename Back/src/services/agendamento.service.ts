import { prisma } from "../prisma/client.js";

function toAgendamentoData(data: any, partial = false) {
  const payload: any = {};

  const titulo = data.titulo ?? data.title;
  const descricao = data.descricao ?? data.description;
  const dataInicio = data.data_inicio ?? data.start;
  const dataFim = data.data_fim ?? data.end;
  const localizacao = data.localizacao ?? data.location;
  const observacao = data.observacao;
  const status = data.status;
  const oficinaId = data.oficina_id ?? data.oficinaId;
  const clienteId = data.cliente_id ?? data.clienteId;
  const veiculoId = data.veiculo_id ?? data.veiculoId;
  const funcionarioId = data.funcionario_id ?? data.funcionarioId;

  if (titulo != null) payload.titulo = String(titulo);
  if (descricao != null) payload.descricao = descricao || null;
  if (dataInicio != null) payload.data_inicio = new Date(dataInicio);
  if (dataFim != null) payload.data_fim = new Date(dataFim);
  if (localizacao != null) payload.localizacao = localizacao || null;
  if (observacao != null) payload.observacao = observacao || null;
  if (status != null) payload.status = status;
  if (oficinaId != null) payload.oficina_id = Number(oficinaId);
  if (clienteId != null) payload.cliente_id = Number(clienteId);
  if (veiculoId != null) payload.veiculo_id = Number(veiculoId);
  if (funcionarioId != null && funcionarioId !== "") payload.funcionario_id = Number(funcionarioId);

  if (!partial) {
    for (const field of ["titulo", "data_inicio", "data_fim", "oficina_id", "cliente_id", "veiculo_id"]) {
      if (payload[field] == null || (payload[field] instanceof Date && Number.isNaN(payload[field].getTime()))) {
        throw new Error(`${field} e obrigatorio.`);
      }
    }
  }

  if (payload.data_inicio instanceof Date && Number.isNaN(payload.data_inicio.getTime())) {
    throw new Error("data_inicio invalida.");
  }
  if (payload.data_fim instanceof Date && Number.isNaN(payload.data_fim.getTime())) {
    throw new Error("data_fim invalida.");
  }

  return payload;
}

const includeRelations = {
  cliente: true,
  veiculo: true,
  funcionario: true,
};

export const AgendamentoService = {
  async list() {
    return prisma.agendamento.findMany({ where: { deleted_at: null }, include: includeRelations });
  },

  async getById(id: number) {
    return prisma.agendamento.findFirst({ where: { id, deleted_at: null }, include: includeRelations });
  },

  async listByOficina(oficina_id: number) {
    return prisma.agendamento.findMany({ where: { oficina_id, deleted_at: null }, include: includeRelations });
  },

  async create(data: any) {
    return prisma.agendamento.create({ data: toAgendamentoData(data), include: includeRelations });
  },

  async update(id: number, data: any) {
    return prisma.agendamento.update({
      where: { id },
      data: toAgendamentoData(data, true),
      include: includeRelations,
    });
  },

  async remove(id: number) {
    return prisma.agendamento.update({ where: { id }, data: { deleted_at: new Date(), status: "cancelado" } });
  }
};
