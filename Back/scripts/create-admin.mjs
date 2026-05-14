import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACCESS_MODULES = [
  "painel",
  "agenda",
  "clientes",
  "veiculos",
  "estoque",
  "servicos",
  "ordens",
  "financeiro",
  "fornecedores",
  "orcamentos",
  "funcionarios",
  "relatorios",
  "configuracoes",
  "recursos_adicionais",
];

const ACCESS_ACTIONS = ["read", "create", "update", "delete"];

const allPermissions = Object.fromEntries(
  ACCESS_MODULES.map((module) => [module, ACCESS_ACTIONS])
);

const defaultProfiles = [
  {
    nome: "Proprietario",
    descricao: "Acesso total a todos os modulos e acoes.",
    chave: "proprietario",
    padrao: true,
    permissoes: allPermissions,
  },
  {
    nome: "Mecanico",
    descricao: "Acesso operacional para execucao de servicos e consulta de cadastros.",
    chave: "mecanico",
    padrao: false,
    permissoes: {
      painel: ["read"],
      agenda: ["read", "update"],
      clientes: ["read"],
      veiculos: ["read"],
      estoque: ["read"],
      servicos: ["read"],
      ordens: ["read", "create", "update"],
      orcamentos: ["read", "create", "update"],
    },
  },
  {
    nome: "Recepcao",
    descricao: "Acesso para atendimento, agenda, clientes e abertura de ordens.",
    chave: "recepcao",
    padrao: false,
    permissoes: {
      painel: ["read"],
      agenda: ACCESS_ACTIONS,
      clientes: ["read", "create", "update"],
      veiculos: ["read", "create", "update"],
      estoque: ["read"],
      servicos: ["read"],
      ordens: ["read", "create", "update"],
      financeiro: ["read", "create", "update"],
      fornecedores: ["read"],
      orcamentos: ["read", "create", "update"],
      funcionarios: ["read"],
      relatorios: ["read"],
    },
  },
];

function required(name, aliases = []) {
  const value = [name, ...aliases].map((key) => process.env[key]).find(Boolean);
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value.trim();
}

function optional(name) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

async function ensureProfiles(tx, oficinaId) {
  for (const perfil of defaultProfiles) {
    await tx.perfil_acesso.upsert({
      where: { oficina_id_nome: { oficina_id: oficinaId, nome: perfil.nome } },
      update: {
        descricao: perfil.descricao,
        chave: perfil.chave,
        padrao: perfil.padrao,
        sistema: true,
        permissoes: perfil.permissoes,
        deleted_at: null,
      },
      create: {
        oficina_id: oficinaId,
        nome: perfil.nome,
        descricao: perfil.descricao,
        chave: perfil.chave,
        padrao: perfil.padrao,
        sistema: true,
        permissoes: perfil.permissoes,
      },
    });
  }

  return tx.perfil_acesso.findFirstOrThrow({
    where: { oficina_id: oficinaId, chave: "proprietario", deleted_at: null },
  });
}

async function main() {
  const adminEmail = required("ADMIN_EMAIL").toLowerCase();
  const adminPassword = required("ADMIN_PASSWORD", ["ADMIN_SENHA"]);
  const adminName = required("ADMIN_NAME", ["ADMIN_NOME"]);
  const oficinaNome = required("OFICINA_NOME");
  const cidadeNome = required("OFICINA_CIDADE");
  const cidadeUf = required("OFICINA_UF").toUpperCase();
  const logradouro = required("OFICINA_LOGRADOURO");
  const numero = required("OFICINA_NUMERO");
  const cep = required("OFICINA_CEP");

  const result = await prisma.$transaction(async (tx) => {
    const cidade =
      (await tx.cidade.findFirst({ where: { nome: cidadeNome, uf: cidadeUf } })) ??
      (await tx.cidade.create({ data: { nome: cidadeNome, uf: cidadeUf } }));

    const oficina = await tx.oficina.upsert({
      where: { nome: oficinaNome },
      update: {
        logradouro,
        numero,
        complemento: optional("OFICINA_COMPLEMENTO"),
        cep,
        cidade_id: cidade.id,
        telefone: optional("OFICINA_TELEFONE"),
        email: optional("OFICINA_EMAIL"),
        deleted_at: null,
      },
      create: {
        nome: oficinaNome,
        logradouro,
        numero,
        complemento: optional("OFICINA_COMPLEMENTO"),
        cep,
        cidade_id: cidade.id,
        telefone: optional("OFICINA_TELEFONE"),
        email: optional("OFICINA_EMAIL"),
      },
    });

    const perfil = await ensureProfiles(tx, oficina.id);
    const senhaHash = await bcrypt.hash(adminPassword, 10);

    const usuario = await tx.usuario.upsert({
      where: { email: adminEmail },
      update: {
        nome: adminName,
        senha: senhaHash,
        tipo: "gestoroficina",
        status: "ativo",
        deleted_at: null,
      },
      create: {
        nome: adminName,
        email: adminEmail,
        senha: senhaHash,
        tipo: "gestoroficina",
        status: "ativo",
      },
    });

    await tx.usuario_oficina.upsert({
      where: {
        usuario_id_oficina_id: {
          usuario_id: usuario.id,
          oficina_id: oficina.id,
        },
      },
      update: {
        perfil: "gestoroficina",
        perfil_acesso_id: perfil.id,
        status: "ativo",
        deleted_at: null,
      },
      create: {
        usuario_id: usuario.id,
        oficina_id: oficina.id,
        perfil: "gestoroficina",
        perfil_acesso_id: perfil.id,
        status: "ativo",
      },
    });

    await tx.oficina.update({
      where: { id: oficina.id },
      data: { gestor_usuario_id: usuario.id },
    });

    return { oficina, usuario };
  });

  console.log("Admin inicial pronto.");
  console.log(`Oficina: ${result.oficina.nome} (id ${result.oficina.id})`);
  console.log(`Usuario: ${result.usuario.email} (id ${result.usuario.id})`);
}

main()
  .catch((error) => {
    console.error("Falha ao criar admin inicial:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
