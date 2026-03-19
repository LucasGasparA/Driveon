import api from "../../../../../api/api";

export async function obterClienteDetalhes(id: number) {
  const res = await api.get(`/clientes/${id}`);
  return res.data;
}

export async function obterPagamentosCliente(clienteId: number, oficina_id: number ) {
  const res = await api.get(`/pagamentos?clienteId=${clienteId}&oficina_id=${oficina_id}`);
  return res.data;
}
