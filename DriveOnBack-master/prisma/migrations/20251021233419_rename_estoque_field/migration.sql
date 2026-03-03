/*
  Warnings:

  - You are about to drop the column `estoque` on the `estoque` table. All the data in the column will be lost.
  - Added the required column `estoque_qtd` to the `estoque` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estoque" DROP COLUMN "estoque",
ADD COLUMN     "estoque_qtd" INTEGER NOT NULL;
