ALTER TABLE "oficina"
ADD COLUMN "recursos_adicionais" JSONB NOT NULL DEFAULT '{"agenda": true, "estoque": true, "fornecedores": true}';
