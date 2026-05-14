import api from "../../../api/api";

export async function listarServicos() {
  const res = await api.get("/servicos");
  return res.data;
}

export async function criarServico(data: any, oficinaId: number) {
  const res = await api.post("/servicos", {
    nome: data.nome,
    descricao: data.descricao,
    preco: Number(data.preco),
    oficina_id: oficinaId,
  });
  return res.data;
}

export async function atualizarServico(id: number, data: any) {
  const res = await api.put(`/servicos/${id}`, {
    nome: data.nome,
    descricao: data.descricao,
    preco: Number(data.preco),
  });
  return res.data;
}

export async function excluirServico(id: number) {
  await api.delete(`/servicos/${id}`);
}
