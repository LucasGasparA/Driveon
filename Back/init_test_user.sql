-- Seed minimo para desenvolvimento local.
-- Usuario: admin@teste.com
-- Senha: senha123

WITH cidade_insert AS (
  INSERT INTO cidade (nome, uf, created_at, updated_at)
  SELECT 'Sao Paulo', 'SP', NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM cidade WHERE nome = 'Sao Paulo' AND uf = 'SP'
  )
  RETURNING id
),
cidade_ref AS (
  SELECT id FROM cidade_insert
  UNION ALL
  SELECT id FROM cidade WHERE nome = 'Sao Paulo' AND uf = 'SP'
  LIMIT 1
),
oficina_seed AS (
  INSERT INTO oficina (nome, logradouro, numero, cep, cidade_id, created_at, updated_at)
  SELECT 'Oficina Teste', 'Rua Teste', '123', '12345-678', id, NOW(), NOW()
  FROM cidade_ref
  ON CONFLICT (nome) DO UPDATE
    SET updated_at = EXCLUDED.updated_at
  RETURNING id
),
usuario_seed AS (
  INSERT INTO usuario (nome, email, senha, tipo, status, created_at, updated_at)
  SELECT
    'Admin Teste',
    'admin@teste.com',
    '$2b$10$kg.y0CCtupxnbUZB0zdV/uGFdmZbIN6M/hbTYmxFfcKhZSldGMt42',
    'gestoroficina',
    'ativo',
    NOW(),
    NOW()
  FROM oficina_seed
  ON CONFLICT (email) DO NOTHING
  RETURNING id, tipo, status
),
usuario_ref AS (
  SELECT u.id, o.id AS oficina_id, u.tipo, u.status
  FROM usuario_seed u
  CROSS JOIN oficina_seed o
  UNION ALL
  SELECT u.id, o.id AS oficina_id, u.tipo, u.status
  FROM usuario u
  CROSS JOIN oficina_seed o
  WHERE u.email = 'admin@teste.com'
  LIMIT 1
),
perfil_proprietario AS (
  SELECT pa.id
  FROM perfil_acesso pa
  JOIN usuario_ref ur ON ur.oficina_id = pa.oficina_id
  WHERE pa.chave = 'proprietario'
    AND pa.deleted_at IS NULL
  LIMIT 1
)
INSERT INTO usuario_oficina (usuario_id, oficina_id, perfil, perfil_acesso_id, status, created_at, updated_at)
SELECT ur.id, ur.oficina_id, 'gestoroficina', pp.id, ur.status, NOW(), NOW()
FROM usuario_ref
ur
CROSS JOIN perfil_proprietario pp
ON CONFLICT (usuario_id, oficina_id) DO UPDATE
  SET perfil = 'gestoroficina',
      perfil_acesso_id = EXCLUDED.perfil_acesso_id,
      status = EXCLUDED.status,
      deleted_at = NULL,
      updated_at = NOW();

UPDATE usuario
SET tipo = 'gestoroficina',
    status = 'ativo',
    deleted_at = NULL,
    updated_at = NOW()
WHERE email = 'admin@teste.com';

UPDATE oficina
SET gestor_usuario_id = u.id,
    updated_at = NOW()
FROM usuario u
WHERE oficina.nome = 'Oficina Teste'
  AND u.email = 'admin@teste.com';
