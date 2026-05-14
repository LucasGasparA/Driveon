import { prisma } from "../prisma/client.js";
import type { cargo_funcionario } from "@prisma/client";
import bcrypt from "bcrypt";
import { PerfisAcessoService } from "./perfisAcesso.service.js";

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

async function ensureGestorComoFuncionario(oficinaId: number) {
  const oficina = await prisma.oficina.findFirst({
    where: { id: oficinaId, deleted_at: null },
    include: {
      gestor: { select: { id: true, nome: true, email: true, deleted_at: true } },
    },
  });

  if (!oficina?.gestor || oficina.gestor.deleted_at) return;

  const funcionario = await prisma.funcionario.findFirst({
    where: { oficina_id: oficinaId, usuario_id: oficina.gestor.id },
    select: { id: true, deleted_at: true },
  });

  if (funcionario?.deleted_at) {
    await prisma.funcionario.update({
      where: { id: funcionario.id },
      data: {
        nome: oficina.gestor.nome,
        email: oficina.gestor.email,
        telefone: oficina.telefone,
        cargo: "administrador",
        deleted_at: null,
      },
    });
    return;
  }

  if (funcionario) return;

  await prisma.funcionario.create({
    data: {
      nome: oficina.gestor.nome,
      email: oficina.gestor.email,
      telefone: oficina.telefone,
      cargo: "administrador",
      data_contratacao: new Date(),
      oficina: { connect: { id: oficinaId } },
      usuario: { connect: { id: oficina.gestor.id } },
    },
  });
}

export const FuncionariosService = {
  list: async (oficinaId: number) => {
    await ensureGestorComoFuncionario(oficinaId);

    return prisma.funcionario.findMany({
      where: { deleted_at: null, oficina_id: oficinaId },
      orderBy: { id: "desc" },
      include: {
        usuario: { select: { id: true, email: true, nome: true, status: true } },
        oficina: true,
      },
    });
  },

  getById: (id: number, oficinaId: number) =>
    prisma.funcionario.findFirst({
      where: { id, deleted_at: null, oficina_id: oficinaId },
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
    const perfilAcessoId = data?.perfil_acesso_id ? Number(data.perfil_acesso_id) : null;

    if (!oficinaId || Number.isNaN(oficinaId)) {
      throw new Error("oficina_id é obrigatório.");
    }
    if (!nome || !email || !telefone) {
      throw new Error("Nome, e-mail e telefone são obrigatórios.");
    }

    const senhaHash = await bcrypt.hash(senhaPura, 10);
    const perfilAcesso =
      perfilAcessoId
        ? await prisma.perfil_acesso.findFirst({
            where: { id: perfilAcessoId, oficina_id: oficinaId, deleted_at: null },
          })
        : await PerfisAcessoService.findDefault(
            oficinaId,
            cargo === "mecanico" ? "mecanico" : cargo === "administrador" || cargo === "gerente" ? "proprietario" : "recepcao"
          );

    if (!perfilAcesso) throw new Error("Perfil de acesso nao encontrado.");

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
        update: {
          perfil: cargo === "administrador" || cargo === "gerente" ? "gestoroficina" : "funcionario",
          perfil_acesso_id: perfilAcesso.id,
          status: "ativo",
          deleted_at: null,
        },
        create: {
          usuario_id: usuario.id,
          oficina_id: oficinaId,
          perfil: cargo === "administrador" || cargo === "gerente" ? "gestoroficina" : "funcionario",
          perfil_acesso_id: perfilAcesso.id,
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

  update: async (id: number, data: any, oficinaId: number) => {
    const existing = await prisma.funcionario.findFirst({
      where: { id, oficina_id: oficinaId, deleted_at: null },
      select: { usuario_id: true, oficina_id: true },
    });
    if (!existing) throw new Error("Funcionario nao encontrado nesta oficina.");

    const patch: any = {};

    if (data?.nome != null) patch.nome = String(data.nome).trim();
    if (data?.email != null) patch.email = String(data.email).trim();
    if (data?.telefone != null) patch.telefone = normTelefone(data.telefone);
    if (data?.cargo != null) patch.cargo = toCargoEnum(data.cargo);
    if (data?.data_contratacao)
      patch.data_contratacao = new Date(data.data_contratacao);

    if (data?.senha) {
      patch.usuario = {
        update: {
          senha: await bcrypt.hash(data.senha, 10),
        },
      };
    }

    if (data?.perfil_acesso_id) {
      if (!existing.usuario_id) throw new Error("Funcionario sem usuario vinculado.");

      const perfilAcessoId = Number(data.perfil_acesso_id);
      const perfilAcesso = await prisma.perfil_acesso.findFirst({
        where: { id: perfilAcessoId, oficina_id: existing.oficina_id, deleted_at: null },
      });
      if (!perfilAcesso) throw new Error("Perfil de acesso nao encontrado.");

      await prisma.usuario_oficina.update({
        where: {
          usuario_id_oficina_id: {
            usuario_id: existing.usuario_id,
            oficina_id: existing.oficina_id,
          },
        },
        data: { perfil_acesso_id: perfilAcessoId },
      });
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

  delete: async (id: number, oficinaId: number) => {
    try {
      const funcionario = await prisma.funcionario.findFirst({
        where: { id, oficina_id: oficinaId, deleted_at: null },
        select: {
          usuario_id: true,
          oficina: { select: { gestor_usuario_id: true } },
        },
      });
      if (!funcionario) throw new Error("Funcionario nao encontrado nesta oficina.");

      if (funcionario?.usuario_id && funcionario.usuario_id === funcionario.oficina.gestor_usuario_id) {
        throw new Error("O gestor da oficina nao pode ser excluido da lista de funcionarios.");
      }

      const ordensVinculadas = await prisma.ordem_servico.count({
        where: { funcionario_id: id, oficina_id: oficinaId },
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
