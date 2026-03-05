import api from "./api";

export async function listarClientes() {
  const { data } = await api.get("/clientes");
  return data;
}

export async function criarCliente(data: any) {
  const res = await api.post("/clientes", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: data.name,
      email: data.email,
      telefone: data.phone,
      observacao: data.notes,
      dataNascimento: data.birthDate ? new Date(data.birthDate).toISOString() : null,
      status:
        data.plan === 'Permanent'
          ? 'Ativo'
          : data.plan === 'Trial'
          ? 'Em teste'
          : 'Inativo',
    }),
  });
  if (!res.ok) throw new Error('Erro ao criar cliente');
  return res.json();
}
