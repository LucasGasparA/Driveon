import { prisma } from "../prisma/client.js";
import type { cargo_funcionario } from "@prisma/client";
import bcrypt from "bcrypt";

function normTelefone(t?: string) {
  return (t || "").replace(/\D/g, "");
}

function toCargoEnum(cargo: any): cargo_funcionario {
  const k = String(cargo || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  switch (k) {
    case "mecanico":
      return "mecanico";
    case "atendente":
      return "atendente";
    case "gerente":
      return "gerente";
    case "administrador":
      return "administrador";
    default:
      return "mecanico";
  }
}

export const FuncionariosService = {
  list: (oficinaId?: number) =>
    prisma.funcionario.findMany({
      where: { deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
      orderBy: { id: "desc" },
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
    }),

  getById: (id: number, oficinaId?: number) =>
    prisma.funcionario.findFirst({
      where: { id, deleted_at: null, ...(oficinaId ? { oficina_id: oficinaId } : {}) },
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
    }),

  create: async (data: any) => {
    const nome = (data?.nome ?? "").trim();
    const email = (data?.email ?? "").trim();
    const telefone = normTelefone(data?.telefone);
    const cargo = toCargoEnum(data?.cargo);
    const senhaPura = String(data?.senha ?? "123456");
    const oficinaId = Number(data?.oficina_id);

    if (!oficinaId || Number.isNaN(oficinaId)) {
      throw new Error("oficina_id é obrigatório.");
    }
    if (!nome || !email || !telefone) {
      throw new Error("Nome, e-mail e telefone são obrigatórios.");
    }

    const senhaHash = await bcrypt.hash(senhaPura, 10);

    const dataContratacao = data?.data_contratacao
      ? new Date(data.data_contratacao)
      : new Date();

    const funcionario = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.upsert({
        where: { email },
        update: {
          nome,
          status: "ativo",
          deleted_at: null,
        },
        create: {
          nome,
          email,
          senha: senhaHash,
          tipo: "funcionario",
          status: "ativo",
        },
      });

      await tx.usuario_oficina.upsert({
        where: { usuario_id_oficina_id: { usuario_id: usuario.id, oficina_id: oficinaId } },
        update: { perfil: "funcionario", status: "ativo", deleted_at: null },
        create: {
          usuario_id: usuario.id,
          oficina_id: oficinaId,
          perfil: "funcionario",
          status: "ativo",
        },
      });

      return tx.funcionario.create({
        data: {
          nome,
          email,
          telefone,
          cargo,
          data_contratacao: dataContratacao,
          oficina: { connect: { id: oficinaId } },
          usuario: { connect: { id: usuario.id } },
        },
        include: {
          usuario: { select: { id: true, email: true, nome: true, status: true } },
          oficina: true,
        },
      });
    });

    return funcionario;
  },

  update: async (id: number, data: any) => {
    const patch: any = {};

    if (data?.nome != null) patch.nome = String(data.nome).trim();
    if (data?.email != null) patch.email = String(data.email).trim();
    if (data?.telefone != null) patch.telefone = normTelefone(data.telefone);
    if (data?.cargo != null) patch.cargo = toCargoEnum(data.cargo);
    if (data?.data_contratacao)
      patch.data_contratacao = new Date(data.data_contratacao);

    if (data?.oficina_id) {
      const oficinaId = Number(data.oficina_id);
      if (!oficinaId || Number.isNaN(oficinaId)) {
        throw new Error("oficina_id inválido.");
      }
      patch.oficina = { connect: { id: oficinaId } };
    }

    if (data?.senha) {
      patch.usuario = {
        update: {
          senha: await bcrypt.hash(data.senha, 10),
        },
      };
    }

    const funcionario = await prisma.funcionario.update({
      where: { id },
      data: patch,
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
    });

    return funcionario;
  },

  delete: async (id: number) => {
    try {
      const ordensVinculadas = await prisma.ordem_servico.count({
        where: { funcionario_id: id },
      });

      if (ordensVinculadas > 0) {
        return await prisma.funcionario.findUnique({
          where: { id },
          include: {
            usuario: { select: { id: true, email: true, nome: true, status: true } },
            oficina: true,
          },
        });
      }

      return await prisma.funcionario.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          usuario: {
            update: {
              deleted_at: new Date(),
              status: "inativo",
              acessos: {
                updateMany: {
                  where: { deleted_at: null },
                  data: { deleted_at: new Date(), status: "inativo" },
                },
              },
            },
          },
        },
      });
    } catch (err: any) {
      console.error("Erro ao desativar/excluir funcionário:", err);
      throw new Error(
        "Não foi possível excluir o funcionário. Pode haver vínculos de ordens de serviço."
      );
    }
  },
};
