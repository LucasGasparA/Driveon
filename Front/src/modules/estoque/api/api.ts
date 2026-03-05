import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/estoque",
});

export async function listarEstoque() {
  const res = await api.get("/");
  return res.data;
}

export async function criarEstoque(data: any, oficinaId: number) {
  const res = await api.post("/", {
    nome: data.nome,
    descricao: data.descricao,
    preco_custo: Number(data.preco_custo),
    preco_venda: Number(data.preco_venda),
    estoque_qtd: Number(data.estoque),
    oficinaId,
  });
  return res.data;
}

export async function atualizarEstoque(id: number, data: any) {
  const res = await api.put(`/${id}`, {
    nome: data.nome,
    descricao: data.descricao,
    preco_custo: Number(data.preco_custo),
    preco_venda: Number(data.preco_venda),
    estoque_qtd: Number(data.estoque),
  });
  return res.data;
}

export async function excluirEstoque(id: number) {
  await api.delete(`/${id}`);
}
