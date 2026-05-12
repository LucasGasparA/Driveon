import api from "../../../api/api";

export const additionalResourceKeys = ["agenda", "estoque", "fornecedores"] as const;

export type AdditionalResourceKey = (typeof additionalResourceKeys)[number];
export type AdditionalResourcesMap = Record<AdditionalResourceKey, boolean>;

export const defaultAdditionalResources: AdditionalResourcesMap = {
  agenda: true,
  estoque: true,
  fornecedores: true,
};

export async function obterRecursosAdicionais() {
  const { data } = await api.get<AdditionalResourcesMap>("/recursos-adicionais");
  return { ...defaultAdditionalResources, ...data };
}

export async function salvarRecursosAdicionais(recursos: AdditionalResourcesMap) {
  const { data } = await api.put<AdditionalResourcesMap>("/recursos-adicionais", recursos);
  return { ...defaultAdditionalResources, ...data };
}
