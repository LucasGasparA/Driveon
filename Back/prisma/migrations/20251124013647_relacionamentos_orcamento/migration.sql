/*
  Warnings:

  - You are about to drop the column `cliente` on the `orcamento` table. All the data in the column will be lost.
  - You are about to drop the column `veiculo` on the `orcamento` table. All the data in the column will be lost.
  - Added the required column `cliente_id` to the `orcamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veiculo_id` to the `orcamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orcamento" DROP COLUMN "cliente",
DROP COLUMN "veiculo",
ADD COLUMN     "cliente_id" INTEGER NOT NULL,
ADD COLUMN     "veiculo_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
