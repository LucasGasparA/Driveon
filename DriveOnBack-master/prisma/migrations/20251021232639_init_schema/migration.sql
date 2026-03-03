/*
  Warnings:

  - You are about to drop the `Cidade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompraPeca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estoque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Fornecedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Funcionario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemOrdemServico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Oficina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrdemServico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Peca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Servico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Veiculo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "cargo_funcionario" AS ENUM ('mecanico', 'atendente', 'gerente', 'administrador');

-- CreateEnum
CREATE TYPE "status_os" AS ENUM ('aberta', 'em_andamento', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_item_os" AS ENUM ('servico', 'peca');

-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('funcionario', 'cliente', 'gestoroficina', 'sistema');

-- CreateEnum
CREATE TYPE "status_usuario" AS ENUM ('ativo', 'inativo', 'bloqueado');

-- DropForeignKey
ALTER TABLE "public"."Cliente" DROP CONSTRAINT "Cliente_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cliente" DROP CONSTRAINT "Cliente_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompraPeca" DROP CONSTRAINT "CompraPeca_fornecedor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompraPeca" DROP CONSTRAINT "CompraPeca_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompraPeca" DROP CONSTRAINT "CompraPeca_peca_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Estoque" DROP CONSTRAINT "Estoque_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Fornecedor" DROP CONSTRAINT "Fornecedor_cidade_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Fornecedor" DROP CONSTRAINT "Fornecedor_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Funcionario" DROP CONSTRAINT "Funcionario_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Funcionario" DROP CONSTRAINT "Funcionario_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemOrdemServico" DROP CONSTRAINT "ItemOrdemServico_ordem_servico_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemOrdemServico" DROP CONSTRAINT "ItemOrdemServico_peca_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemOrdemServico" DROP CONSTRAINT "ItemOrdemServico_servico_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Oficina" DROP CONSTRAINT "Oficina_cidade_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Oficina" DROP CONSTRAINT "Oficina_gestor_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_funcionario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_veiculo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Peca" DROP CONSTRAINT "Peca_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Servico" DROP CONSTRAINT "Servico_oficina_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Veiculo" DROP CONSTRAINT "Veiculo_cliente_id_fkey";

-- DropTable
DROP TABLE "public"."Cidade";

-- DropTable
DROP TABLE "public"."Cliente";

-- DropTable
DROP TABLE "public"."CompraPeca";

-- DropTable
DROP TABLE "public"."Estoque";

-- DropTable
DROP TABLE "public"."Fornecedor";

-- DropTable
DROP TABLE "public"."Funcionario";

-- DropTable
DROP TABLE "public"."ItemOrdemServico";

-- DropTable
DROP TABLE "public"."Oficina";

-- DropTable
DROP TABLE "public"."OrdemServico";

-- DropTable
DROP TABLE "public"."Peca";

-- DropTable
DROP TABLE "public"."Servico";

-- DropTable
DROP TABLE "public"."Usuario";

-- DropTable
DROP TABLE "public"."Veiculo";

-- DropEnum
DROP TYPE "public"."CargoFuncionario";

-- DropEnum
DROP TYPE "public"."StatusOS";

-- DropEnum
DROP TYPE "public"."StatusUsuario";

-- DropEnum
DROP TYPE "public"."TipoItemOS";

-- DropEnum
DROP TYPE "public"."TipoUsuario";

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" "tipo_usuario" NOT NULL,
    "status" "status_usuario" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "telefone" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "observacao" TEXT,
    "usuario_id" INTEGER,
    "oficina_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficina" (
    "id" SERIAL NOT NULL,
    "gestor_usuario_id" INTEGER,
    "nome" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "cep" TEXT NOT NULL,
    "cidade_id" INTEGER NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oficina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "estado_civil" TEXT,
    "genero" TEXT,
    "nacionalidade" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "cep" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cargo" "cargo_funcionario" NOT NULL,
    "departamento" TEXT,
    "data_contratacao" TIMESTAMP(3) NOT NULL,
    "tipo_contratacao" TEXT,
    "salario" DECIMAL(65,30),
    "gestor" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "cnh" TEXT,
    "validade_cnh" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "exige_troca_senha" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculo" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "placa" TEXT NOT NULL,
    "cor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordem_servico" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" TIMESTAMP(3),
    "status" "status_os" NOT NULL DEFAULT 'aberta',
    "observacoes" TEXT,
    "valor_total" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordem_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_ordem_servico" (
    "id" SERIAL NOT NULL,
    "ordem_servico_id" INTEGER NOT NULL,
    "tipo_item" "tipo_item_os" NOT NULL,
    "servico_id" INTEGER,
    "peca_id" INTEGER,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_ordem_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "cep" TEXT,
    "cidade_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco_custo" DECIMAL(65,30) NOT NULL,
    "preco_venda" DECIMAL(65,30) NOT NULL,
    "estoque" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servico" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peca" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_custo" DECIMAL(65,30) NOT NULL,
    "preco_venda" DECIMAL(65,30) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_peca" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "fornecedor_id" INTEGER NOT NULL,
    "peca_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_compra_unitario" DECIMAL(65,30) NOT NULL,
    "data_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compra_peca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_usuario_id_key" ON "cliente"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_gestor_usuario_id_key" ON "oficina"("gestor_usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_nome_key" ON "oficina"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_email_key" ON "oficina"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionario_usuario_id_key" ON "funcionario"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "funcionario_cpf_key" ON "funcionario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "veiculo_placa_key" ON "veiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_nome_key" ON "fornecedor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_email_key" ON "fornecedor"("email");

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficina" ADD CONSTRAINT "oficina_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficina" ADD CONSTRAINT "oficina_gestor_usuario_id_fkey" FOREIGN KEY ("gestor_usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo" ADD CONSTRAINT "veiculo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordem_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "peca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico" ADD CONSTRAINT "servico_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peca" ADD CONSTRAINT "peca_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_peca" ADD CONSTRAINT "compra_peca_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_peca" ADD CONSTRAINT "compra_peca_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_peca" ADD CONSTRAINT "compra_peca_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "peca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
