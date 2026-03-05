import api from "../../../api/api";
import { type VehicleForm } from "../dialog";

export async function listarVeiculos() {
  const { data } = await api.get("/veiculos");
  return data.map((v: any) => ({
    id: String(v.id),
    cliente: v.cliente?.nome || "",
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    placa: v.placa,
    cor: v.cor,
    createdAt: v.created_at,
  }));
}

export async function criarVeiculo(data: VehicleForm) {
  const { data: v } = await api.post("/veiculos", data);
  return {
    id: String(v.id),
    cliente: v.cliente?.nome || "",
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    placa: v.placa,
    cor: v.cor,
    createdAt: v.created_at,
  };
}

export async function atualizarVeiculo(id: string, data: VehicleForm) {
  const { data: v } = await api.put(`/veiculos/${id}`, data);
  return {
    id: String(v.id),
    cliente: v.cliente?.nome || "",
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    placa: v.placa,
    cor: v.cor,
    createdAt: v.created_at,
  };
}

export async function excluirVeiculo(id: string) {
  await api.delete(`/veiculos/${id}`);
}
