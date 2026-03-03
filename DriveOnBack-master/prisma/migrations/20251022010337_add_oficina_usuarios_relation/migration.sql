/*
  Warnings:

  - Added the required column `oficina_id` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "oficina_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
