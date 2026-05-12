import api from "../../../api/api";
import type { PermissionsMap } from "../../../permissions/accessProfiles";

export type PerfilAcesso = {
  id: number;
  nome: string;
  descricao?: string | null;
  chave?: string | null;
  padrao: boolean;
  sistema: boolean;
  permissoes: PermissionsMap;
  usuarios_vinculados?: number;
};

export async function listarPerfisAcesso() {
  const { data } = await api.get<PerfilAcesso[]>("/perfis-acesso");
  return data;
}

export async function criarPerfilAcesso(data: Partial<PerfilAcesso>) {
  const res = await api.post<PerfilAcesso>("/perfis-acesso", data);
  return res.data;
}

export async function atualizarPerfilAcesso(id: number, data: Partial<PerfilAcesso>) {
  const res = await api.put<PerfilAcesso>(`/perfis-acesso/${id}`, data);
  return res.data;
}

export async function excluirPerfilAcesso(id: number) {
  await api.delete(`/perfis-acesso/${id}`);
}
