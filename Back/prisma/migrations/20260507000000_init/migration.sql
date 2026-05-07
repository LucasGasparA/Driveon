-- CreateEnum
CREATE TYPE "cargo_funcionario" AS ENUM ('mecanico', 'atendente', 'gerente', 'administrador');

-- CreateEnum
CREATE TYPE "status_os" AS ENUM ('aberta', 'em_andamento', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_item_os" AS ENUM ('servico', 'peca');

-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('funcionario', 'cliente', 'gestoroficina', 'sistema');

-- CreateEnum
CREATE TYPE "status_cliente" AS ENUM ('ativo', 'inativo', 'bloqueado');

-- CreateEnum
CREATE TYPE "status_usuario" AS ENUM ('ativo', 'inativo', 'bloqueado');

-- CreateEnum
CREATE TYPE "tipo_pagamento" AS ENUM ('pagar', 'receber');

-- CreateEnum
CREATE TYPE "status_pagamento" AS ENUM ('pendente', 'pago', 'cancelado');

-- CreateEnum
CREATE TYPE "metodo_pagamento" AS ENUM ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia');

-- CreateEnum
CREATE TYPE "status_orcamento" AS ENUM ('analise', 'aprovado', 'recusado');

-- CreateEnum
CREATE TYPE "status_agendamento" AS ENUM ('pendente', 'confirmado', 'realizado', 'cancelado');

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" "tipo_usuario" NOT NULL DEFAULT 'funcionario',
    "status" "status_usuario" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "status" "status_cliente" NOT NULL DEFAULT 'ativo',
    "telefone" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "observacao" TEXT,
    "usuario_id" INTEGER,
    "oficina_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficina" (
    "id" SERIAL NOT NULL,
    "gestor_usuario_id" INTEGER,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "cep" TEXT NOT NULL,
    "cidade_id" INTEGER NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "oficina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" "cargo_funcionario" NOT NULL,
    "data_contratacao" TIMESTAMP(3) NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculo" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "placa" TEXT NOT NULL,
    "cor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

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
    "estoque_qtd" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

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
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "compra_peca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "oficina_id" INTEGER NOT NULL,
    "ordem_servico_id" INTEGER,
    "fornecedor_id" INTEGER,
    "tipo" "tipo_pagamento" NOT NULL,
    "metodo" "metodo_pagamento" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "status_pagamento" NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "categoria" TEXT,
    "descricao" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_oficina" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "perfil" "tipo_usuario" NOT NULL DEFAULT 'funcionario',
    "status" "status_usuario" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuario_oficina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "status" "status_orcamento" NOT NULL DEFAULT 'analise',
    "cliente_id" INTEGER NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "localizacao" TEXT,
    "status" "status_agendamento" NOT NULL DEFAULT 'pendente',
    "observacao" TEXT,
    "oficina_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "veiculo_id" INTEGER NOT NULL,
    "funcionario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_status_idx" ON "usuario"("status");

-- CreateIndex
CREATE INDEX "usuario_deleted_at_idx" ON "usuario"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_usuario_id_key" ON "cliente"("usuario_id");

-- CreateIndex
CREATE INDEX "cliente_oficina_id_idx" ON "cliente"("oficina_id");

-- CreateIndex
CREATE INDEX "cliente_status_idx" ON "cliente"("status");

-- CreateIndex
CREATE INDEX "cliente_deleted_at_idx" ON "cliente"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cpf_oficina_id_key" ON "cliente"("cpf", "oficina_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_oficina_id_key" ON "cliente"("email", "oficina_id");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_gestor_usuario_id_key" ON "oficina"("gestor_usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_nome_key" ON "oficina"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_cnpj_key" ON "oficina"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "oficina_email_key" ON "oficina"("email");

-- CreateIndex
CREATE INDEX "oficina_cidade_id_idx" ON "oficina"("cidade_id");

-- CreateIndex
CREATE INDEX "oficina_deleted_at_idx" ON "oficina"("deleted_at");

-- CreateIndex
CREATE INDEX "funcionario_oficina_id_idx" ON "funcionario"("oficina_id");

-- CreateIndex
CREATE INDEX "funcionario_cargo_idx" ON "funcionario"("cargo");

-- CreateIndex
CREATE INDEX "funcionario_deleted_at_idx" ON "funcionario"("deleted_at");

-- CreateIndex
CREATE INDEX "veiculo_cliente_id_idx" ON "veiculo"("cliente_id");

-- CreateIndex
CREATE INDEX "veiculo_oficina_id_idx" ON "veiculo"("oficina_id");

-- CreateIndex
CREATE INDEX "veiculo_placa_idx" ON "veiculo"("placa");

-- CreateIndex
CREATE INDEX "veiculo_deleted_at_idx" ON "veiculo"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "veiculo_placa_oficina_id_key" ON "veiculo"("placa", "oficina_id");

-- CreateIndex
CREATE INDEX "ordem_servico_oficina_id_idx" ON "ordem_servico"("oficina_id");

-- CreateIndex
CREATE INDEX "ordem_servico_cliente_id_idx" ON "ordem_servico"("cliente_id");

-- CreateIndex
CREATE INDEX "ordem_servico_status_idx" ON "ordem_servico"("status");

-- CreateIndex
CREATE INDEX "ordem_servico_data_abertura_idx" ON "ordem_servico"("data_abertura");

-- CreateIndex
CREATE INDEX "ordem_servico_deleted_at_idx" ON "ordem_servico"("deleted_at");

-- CreateIndex
CREATE INDEX "item_ordem_servico_ordem_servico_id_idx" ON "item_ordem_servico"("ordem_servico_id");

-- CreateIndex
CREATE INDEX "item_ordem_servico_deleted_at_idx" ON "item_ordem_servico"("deleted_at");

-- CreateIndex
CREATE INDEX "fornecedor_oficina_id_idx" ON "fornecedor"("oficina_id");

-- CreateIndex
CREATE INDEX "fornecedor_deleted_at_idx" ON "fornecedor"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_nome_oficina_id_key" ON "fornecedor"("nome", "oficina_id");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_email_oficina_id_key" ON "fornecedor"("email", "oficina_id");

-- CreateIndex
CREATE INDEX "estoque_oficina_id_idx" ON "estoque"("oficina_id");

-- CreateIndex
CREATE INDEX "estoque_deleted_at_idx" ON "estoque"("deleted_at");

-- CreateIndex
CREATE INDEX "servico_oficina_id_idx" ON "servico"("oficina_id");

-- CreateIndex
CREATE INDEX "servico_deleted_at_idx" ON "servico"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "servico_nome_oficina_id_key" ON "servico"("nome", "oficina_id");

-- CreateIndex
CREATE INDEX "peca_oficina_id_idx" ON "peca"("oficina_id");

-- CreateIndex
CREATE INDEX "peca_deleted_at_idx" ON "peca"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "peca_nome_oficina_id_key" ON "peca"("nome", "oficina_id");

-- CreateIndex
CREATE INDEX "compra_peca_oficina_id_idx" ON "compra_peca"("oficina_id");

-- CreateIndex
CREATE INDEX "compra_peca_fornecedor_id_idx" ON "compra_peca"("fornecedor_id");

-- CreateIndex
CREATE INDEX "compra_peca_data_compra_idx" ON "compra_peca"("data_compra");

-- CreateIndex
CREATE INDEX "compra_peca_deleted_at_idx" ON "compra_peca"("deleted_at");

-- CreateIndex
CREATE INDEX "pagamento_oficina_id_idx" ON "pagamento"("oficina_id");

-- CreateIndex
CREATE INDEX "pagamento_cliente_id_idx" ON "pagamento"("cliente_id");

-- CreateIndex
CREATE INDEX "pagamento_status_idx" ON "pagamento"("status");

-- CreateIndex
CREATE INDEX "pagamento_data_vencimento_idx" ON "pagamento"("data_vencimento");

-- CreateIndex
CREATE INDEX "pagamento_deleted_at_idx" ON "pagamento"("deleted_at");

-- CreateIndex
CREATE INDEX "usuario_oficina_oficina_id_idx" ON "usuario_oficina"("oficina_id");

-- CreateIndex
CREATE INDEX "usuario_oficina_status_idx" ON "usuario_oficina"("status");

-- CreateIndex
CREATE INDEX "usuario_oficina_deleted_at_idx" ON "usuario_oficina"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_oficina_usuario_id_oficina_id_key" ON "usuario_oficina"("usuario_id", "oficina_id");

-- CreateIndex
CREATE INDEX "orcamento_cliente_id_idx" ON "orcamento"("cliente_id");

-- CreateIndex
CREATE INDEX "orcamento_status_idx" ON "orcamento"("status");

-- CreateIndex
CREATE INDEX "orcamento_deleted_at_idx" ON "orcamento"("deleted_at");

-- CreateIndex
CREATE INDEX "agendamento_oficina_id_idx" ON "agendamento"("oficina_id");

-- CreateIndex
CREATE INDEX "agendamento_cliente_id_idx" ON "agendamento"("cliente_id");

-- CreateIndex
CREATE INDEX "agendamento_data_inicio_idx" ON "agendamento"("data_inicio");

-- CreateIndex
CREATE INDEX "agendamento_status_idx" ON "agendamento"("status");

-- CreateIndex
CREATE INDEX "agendamento_deleted_at_idx" ON "agendamento"("deleted_at");

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficina" ADD CONSTRAINT "oficina_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficina" ADD CONSTRAINT "oficina_gestor_usuario_id_fkey" FOREIGN KEY ("gestor_usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo" ADD CONSTRAINT "veiculo_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo" ADD CONSTRAINT "veiculo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordem_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "peca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordem_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_oficina" ADD CONSTRAINT "usuario_oficina_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_oficina" ADD CONSTRAINT "usuario_oficina_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

