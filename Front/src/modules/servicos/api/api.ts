import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/servicos",
});

export async function listarServicos() {
  const res = await api.get("/");
  return res.data;
}

export async function criarServico(data: any, oficinaId: number) {
  const res = await api.post("/", {
    nome: data.nome,
    descricao: data.descricao,
    preco: Number(data.preco),
    oficina_id: oficinaId,
  });
  return res.data;
}

export async function atualizarServico(id: number, data: any) {
  const res = await api.put(`/${id}`, {
    nome: data.nome,
    descricao: data.descricao,
    preco: Number(data.preco),
  });
  return res.data;
}

export async function excluirServico(id: number) {
  await api.delete(`/${id}`);
}
