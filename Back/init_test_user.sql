-- Insert a test city
INSERT INTO cidade (nome, uf, created_at, updated_at) 
VALUES ('São Paulo', 'SP', NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- Insert a test office
INSERT INTO oficina (nome, logradouro, numero, cep, cidade_id, created_at, updated_at) 
VALUES ('Oficina Teste', 'Rua Teste', '123', '12345-678', 2, NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- Insert a test user with password 'senha123'
-- Hash generated using bcrypt with 10 rounds: password = 'senha123'
INSERT INTO usuario (nome, email, senha, tipo, status, oficina_id, created_at, updated_at)
VALUES ('Admin Teste', 'admin@teste.com', '$2b$10$L/BDa6pf/eFdM8x3Ij5IFOyJ/J8Ik9pL6QwK7ZvP2mN0J5I5J5I5I', 'funcionario', 'ativo', 5, NOW(), NOW())
ON CONFLICT DO NOTHING;
