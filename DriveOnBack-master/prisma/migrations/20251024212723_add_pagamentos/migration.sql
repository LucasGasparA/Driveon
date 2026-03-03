-- CreateEnum
CREATE TYPE "tipo_pagamento" AS ENUM ('pagar', 'receber');

-- CreateEnum
CREATE TYPE "status_pagamento" AS ENUM ('pendente', 'pago', 'cancelado');

-- CreateEnum
CREATE TYPE "metodo_pagamento" AS ENUM ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia');

-- CreateTable
CREATE TABLE "pagamento" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "ordem_servico_id" INTEGER,
    "fornecedor_id" INTEGER,
    "tipo" "tipo_pagamento" NOT NULL,
    "metodo" "metodo_pagamento" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "status_pagamento" NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordem_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
