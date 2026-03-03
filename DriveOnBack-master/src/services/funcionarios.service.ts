import { prisma } from "../prisma/client";
import { cargo_funcionario, tipo_usuario, status_usuario } from "@prisma/client";
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
      return cargo_funcionario.mecanico;
    case "atendente":
      return cargo_funcionario.atendente;
    case "gerente":
      return cargo_funcionario.gerente;
    case "administrador":
      return cargo_funcionario.administrador;
    default:
      return cargo_funcionario.mecanico;
  }
}

export const FuncionariosService = {
  list: () =>
    prisma.funcionario.findMany({
      orderBy: { id: "desc" },
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
    }),

  getById: (id: number) =>
    prisma.funcionario.findUnique({
      where: { id },
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

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        email,
        telefone,
        cargo,
        data_contratacao: dataContratacao,
        oficina: { connect: { id: oficinaId } },
        usuario: {
          connectOrCreate: {
            where: { email },
            create: {
              nome,
              email,
              senha: senhaHash,
              tipo: tipo_usuario.funcionario,
              status: status_usuario.ativo,
              oficina: { connect: { id: oficinaId } },
            },
          },
        },
      },
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
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

      return await prisma.funcionario.delete({
        where: { id },
      });
    } catch (err: any) {
      console.error("Erro ao desativar/excluir funcionário:", err);
      throw new Error(
        "Não foi possível excluir o funcionário. Pode haver vínculos de ordens de serviço."
      );
    }
  },
};
