-- CreateEnum
CREATE TYPE "status_orcamento" AS ENUM ('analise', 'aprovado', 'recusado');

-- CreateTable
CREATE TABLE "orcamento" (
    "id" SERIAL NOT NULL,
    "cliente" TEXT NOT NULL,
    "veiculo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "status" "status_orcamento" NOT NULL DEFAULT 'analise',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamento_pkey" PRIMARY KEY ("id")
);
