CREATE TABLE "perfil_acesso" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "chave" TEXT,
    "permissoes" JSONB NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "sistema" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "perfil_acesso_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "usuario_oficina" ADD COLUMN "perfil_acesso_id" INTEGER;

CREATE UNIQUE INDEX "perfil_acesso_oficina_id_nome_key" ON "perfil_acesso"("oficina_id", "nome");
CREATE INDEX "perfil_acesso_oficina_id_idx" ON "perfil_acesso"("oficina_id");
CREATE INDEX "perfil_acesso_deleted_at_idx" ON "perfil_acesso"("deleted_at");
CREATE INDEX "usuario_oficina_perfil_acesso_id_idx" ON "usuario_oficina"("perfil_acesso_id");

ALTER TABLE "perfil_acesso" ADD CONSTRAINT "perfil_acesso_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usuario_oficina" ADD CONSTRAINT "usuario_oficina_perfil_acesso_id_fkey" FOREIGN KEY ("perfil_acesso_id") REFERENCES "perfil_acesso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "perfil_acesso" ("oficina_id", "nome", "descricao", "chave", "permissoes", "padrao", "sistema", "updated_at")
SELECT
  o.id,
  p.nome,
  p.descricao,
  p.chave,
  p.permissoes::jsonb,
  p.padrao,
  true,
  CURRENT_TIMESTAMP
FROM "oficina" o
CROSS JOIN (
  VALUES
    (
      'Proprietário',
      'Acesso total a todos os módulos e ações.',
      'proprietario',
      '{"painel":["read"],"agenda":["read","create","update","delete"],"clientes":["read","create","update","delete"],"veiculos":["read","create","update","delete"],"estoque":["read","create","update","delete"],"servicos":["read","create","update","delete"],"ordens":["read","create","update","delete"],"financeiro":["read","create","update","delete"],"fornecedores":["read","create","update","delete"],"orcamentos":["read","create","update","delete"],"funcionarios":["read","create","update","delete"],"relatorios":["read"],"configuracoes":["read","create","update","delete"]}',
      true
    ),
    (
      'Mecânico',
      'Acesso operacional para execução de serviços e consulta de cadastros.',
      'mecanico',
      '{"painel":["read"],"agenda":["read","update"],"clientes":["read"],"veiculos":["read"],"estoque":["read"],"servicos":["read"],"ordens":["read","create","update"],"orcamentos":["read","create","update"]}',
      false
    ),
    (
      'Recepção',
      'Acesso para atendimento, agenda, clientes e abertura de ordens.',
      'recepcao',
      '{"painel":["read"],"agenda":["read","create","update","delete"],"clientes":["read","create","update"],"veiculos":["read","create","update"],"estoque":["read"],"servicos":["read"],"ordens":["read","create","update"],"financeiro":["read","create","update"],"fornecedores":["read"],"orcamentos":["read","create","update"],"funcionarios":["read"],"relatorios":["read"]}',
      false
    )
) AS p(nome, descricao, chave, permissoes, padrao);

UPDATE "usuario_oficina" uo
SET "perfil_acesso_id" = pa.id
FROM "perfil_acesso" pa
WHERE pa."oficina_id" = uo."oficina_id"
  AND pa."deleted_at" IS NULL
  AND (
    (uo."perfil" = 'gestoroficina' AND pa."chave" = 'proprietario')
    OR (uo."perfil" = 'sistema' AND pa."chave" = 'proprietario')
    OR (uo."perfil" = 'funcionario' AND pa."chave" = 'recepcao')
    OR (uo."perfil" = 'cliente' AND pa."chave" = 'recepcao')
  );
