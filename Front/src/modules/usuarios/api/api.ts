import api from "../../../api/api";

export async function listarFuncionarios() {
  try {
    const res = await api.get("/funcionarios");
    return res.data;
  } catch (error: any) {
    console.error("Erro ao listar funcionários:", error.response?.data || error.message);
    throw error;
  }
}

export async function criarFuncionario(data: any) {
  try {
    const res = await api.post("/funcionarios", data);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao criar funcionário:", error.response?.data || error.message);
    throw error;
  }
}

export async function atualizarFuncionario(id: number, data: any) {
  try {
    const res = await api.put(`/funcionarios/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao atualizar funcionário:", error.response?.data || error.message);
    throw error;
  }
}

export async function deletarFuncionario(id: number) {
  try {
    const res = await api.delete(`/funcionarios/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao excluir funcionário:", error.response?.data || error.message);
    throw error;
  }
}
