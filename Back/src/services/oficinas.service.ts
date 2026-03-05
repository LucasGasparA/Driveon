import { prisma } from "../prisma/client";

export const OficinaService = {
  async create(data: {
    nome: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    cep: string;
    cidade_id: number;
    telefone?: string;
    email?: string;
  }) {
    const { nome, logradouro, numero, cep, cidade_id, complemento, telefone, email } = data;

    if (!nome || !logradouro || !numero || !cep || !cidade_id)
      throw new Error("Campos obrigatórios ausentes para criação da oficina.");

    const existing = await prisma.oficina.findUnique({ where: { nome } });
    if (existing) throw new Error("Já existe uma oficina com este nome.");

    const oficina = await prisma.oficina.create({
      data: { nome, logradouro, numero, complemento, cep, cidade_id, telefone, email },
    });

    return oficina;
  },

  async list() {
    return prisma.oficina.findMany({
      include: { usuarios: { select: { id: true, nome: true, email: true, tipo: true } } },
    });
  },
};
