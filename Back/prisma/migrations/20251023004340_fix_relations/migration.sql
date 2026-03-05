/*
  Warnings:

  - The values [mecanico,atendente,gerente,administrador] on the enum `cargo_funcionario` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ativo` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `cnh` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `data_nascimento` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `departamento` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `estado_civil` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `exige_troca_senha` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `gestor` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `logradouro` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `nacionalidade` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `salario` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_contratacao` on the `funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `validade_cnh` on the `funcionario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[funcionario_id]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nome` on table `usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "cargo_funcionario_new" AS ENUM ('Mecanico', 'Atendente', 'Gerente', 'Administrador');
ALTER TABLE "funcionario" ALTER COLUMN "cargo" TYPE "cargo_funcionario_new" USING ("cargo"::text::"cargo_funcionario_new");
ALTER TYPE "cargo_funcionario" RENAME TO "cargo_funcionario_old";
ALTER TYPE "cargo_funcionario_new" RENAME TO "cargo_funcionario";
DROP TYPE "public"."cargo_funcionario_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."funcionario" DROP CONSTRAINT "funcionario_usuario_id_fkey";

-- DropIndex
DROP INDEX "public"."funcionario_cpf_key";

-- AlterTable
ALTER TABLE "funcionario" DROP COLUMN "ativo",
DROP COLUMN "avatar_url",
DROP COLUMN "cep",
DROP COLUMN "cidade",
DROP COLUMN "cnh",
DROP COLUMN "complemento",
DROP COLUMN "cpf",
DROP COLUMN "data_nascimento",
DROP COLUMN "departamento",
DROP COLUMN "estado",
DROP COLUMN "estado_civil",
DROP COLUMN "exige_troca_senha",
DROP COLUMN "genero",
DROP COLUMN "gestor",
DROP COLUMN "logradouro",
DROP COLUMN "nacionalidade",
DROP COLUMN "numero",
DROP COLUMN "rg",
DROP COLUMN "salario",
DROP COLUMN "tipo_contratacao",
DROP COLUMN "validade_cnh",
ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "funcionario_id" INTEGER,
ALTER COLUMN "tipo" SET DEFAULT 'funcionario',
ALTER COLUMN "nome" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "usuario_funcionario_id_key" ON "usuario"("funcionario_id");

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
