import api from '../api/client';
import type {
  TaskListDto, TaskDetalhe, TaskCreateDto, TaskUpdateDto, TaskStatus
} from '../types/ordemservico';

export async function listarTarefas(params?: {
  status?: TaskStatus | 'todas';
  q?: string;
  due?: 'overdue' | 'today' | 'week' | 'month';
}) {
  const { data } = await api.get<TaskListDto[]>('/api/tarefas', { params });
  return data;
}

export async function obterTarefa(id: number) {
  const { data } = await api.get<TaskDetalhe>(`/api/os/${id}`);
  return data;
}

export async function criarTarefa(dto: TaskCreateDto) {
  const { data } = await api.post<TaskDetalhe>('/api/os', dto);
  return data;
}

export async function atualizarTarefa(id: number, dto: TaskUpdateDto) {
  const { data } = await api.put<TaskDetalhe>(`/api/os/${id}`, dto);
  return data;
}

export async function concluirTarefa(id: number) {
  await api.post<void>(`/api/os/${id}/concluir`, {});
}

export async function excluirTarefa(id: number) {
  await api.delete<void>(`/api/os/${id}`);
}
