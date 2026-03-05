/*
  Warnings:

  - The values [Mecanico,Atendente,Gerente,Administrador] on the enum `cargo_funcionario` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "cargo_funcionario_new" AS ENUM ('mecanico', 'atendente', 'gerente', 'administrador');
ALTER TABLE "funcionario" ALTER COLUMN "cargo" TYPE "cargo_funcionario_new" USING ("cargo"::text::"cargo_funcionario_new");
ALTER TYPE "cargo_funcionario" RENAME TO "cargo_funcionario_old";
ALTER TYPE "cargo_funcionario_new" RENAME TO "cargo_funcionario";
DROP TYPE "public"."cargo_funcionario_old";
COMMIT;
