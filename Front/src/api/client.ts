import api from "./api";

export default api;

export async function listarClientes() {
  const { data } = await api.get("/clientes");
  return data;
}

export async function criarCliente(data: any) {
  const payload = {
    nome: data.nome || data.name,
    email: data.email,
    telefone: data.telefone || data.phone,
    cpf: data.cpf,
    data_nascimento: data.data_nascimento || data.birthDate,
    status: data.status,
    observacao: data.observacao || data.notes,
  };
  
  const res = await api.post("/clientes", payload);
  return res.data;
}

export async function listarVeiculos() {
  const { data } = await api.get("/veiculos");
  return data;
}

export async function listarServicos() {
  const { data } = await api.get("/servicos");
  return data;
}
