# Railway deploy

Este projeto deve ser publicado como tres servicos no Railway: Postgres, API e Web.

## Banco

Crie um Postgres no Railway e use a variavel `DATABASE_URL` gerada por ele no servico da API.

## API

Use a pasta `Back` como root do servico, com o Dockerfile existente.

Variaveis obrigatorias:

```env
DATABASE_URL=<URL do Postgres do Railway>
JWT_SECRET=<chave longa e aleatoria>
CORS_ORIGIN=https://<dominio-do-front>.up.railway.app
```

O Railway injeta `PORT` automaticamente. A API tambem expoe `GET /health` para health checks.

## Web

Use a pasta `Front` como root do servico, com o Dockerfile existente.

Variavel obrigatoria:

```env
API_URL=https://<dominio-da-api>.up.railway.app/api
```

O frontend gera `config.js` no start do container, entao `API_URL` pode ser alterada no Railway sem rebuildar a imagem.

## Observacoes

- Nao execute `Back/init_test_user.sql` em producao.
- Depois do primeiro deploy, copie o dominio publico do front para `CORS_ORIGIN` da API.
- Se mudar o dominio da API, atualize `API_URL` no servico Web e reinicie o deploy.

## Primeiro usuario para teste

No servico da API, defina temporariamente as variaveis abaixo e rode o comando `npm run seed:admin` em um deploy/job/shell da Railway:

```env
ADMIN_NAME="Seu Nome"
ADMIN_EMAIL="seu-email@dominio.com"
ADMIN_PASSWORD="uma-senha-forte"
OFICINA_NOME="Minha Oficina"
OFICINA_CIDADE="Sao Paulo"
OFICINA_UF="SP"
OFICINA_LOGRADOURO="Rua Exemplo"
OFICINA_NUMERO="123"
OFICINA_CEP="00000-000"
OFICINA_TELEFONE="11999999999"
OFICINA_EMAIL="oficina@dominio.com"
```

O script cria a cidade, a oficina, os perfis padrao, o usuario proprietario e o vinculo `usuario_oficina`. Depois que confirmar o login, remova `ADMIN_PASSWORD` das variaveis do Railway.
