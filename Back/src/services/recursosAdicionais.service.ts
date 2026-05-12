import { prisma } from "../prisma/client.js";

export const ADDITIONAL_RESOURCE_KEYS = ["agenda", "estoque", "fornecedores"] as const;

export type AdditionalResourceKey = (typeof ADDITIONAL_RESOURCE_KEYS)[number];
export type AdditionalResourcesMap = Record<AdditionalResourceKey, boolean>;

export const DEFAULT_ADDITIONAL_RESOURCES: AdditionalResourcesMap = {
  agenda: true,
  estoque: true,
  fornecedores: true,
};

function normalize(value: unknown): AdditionalResourcesMap {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return ADDITIONAL_RESOURCE_KEYS.reduce((acc, key) => {
    acc[key] = typeof input[key] === "boolean" ? Boolean(input[key]) : DEFAULT_ADDITIONAL_RESOURCES[key];
    return acc;
  }, {} as AdditionalResourcesMap);
}

export const RecursosAdicionaisService = {
  async get(oficinaId: number) {
    const [oficina] = await prisma.$queryRaw<Array<{ recursos_adicionais: unknown }>>`
      SELECT recursos_adicionais
      FROM "oficina"
      WHERE id = ${oficinaId} AND deleted_at IS NULL
      LIMIT 1
    `;
    if (!oficina) throw new Error("Oficina nao encontrada.");
    return normalize(oficina.recursos_adicionais);
  },

  async update(oficinaId: number, data: unknown) {
    const recursos = normalize(data);
    await prisma.$executeRaw`
      UPDATE "oficina"
      SET recursos_adicionais = CAST(${JSON.stringify(recursos)} AS jsonb)
      WHERE id = ${oficinaId} AND deleted_at IS NULL
    `;
    return recursos;
  },
};
