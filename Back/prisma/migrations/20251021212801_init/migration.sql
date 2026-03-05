-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Ativo';
