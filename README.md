# DriveOn Monorepo

Projeto dividido em dois apps:
- `Back/`: API Node.js + Express + Prisma + PostgreSQL
- `Front/`: SPA React + Vite + MUI

## Requisitos
- Node.js 18+
- npm 9+
- PostgreSQL 15+ (local) ou Docker

## Variaveis de ambiente

### Backend
1. Copie `Back/.env.example` para `Back/.env`.
2. Ajuste:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (opcional, padrao `4000`)

### Frontend
1. Copie `Front/.env.example` para `Front/.env`.
2. Ajuste `VITE_API_URL` para a URL da API.

Padrao recomendado local:
- API: `http://localhost:4000/api`

## Rodando localmente

### 1) Backend
```bash
cd Back
npm install
npm run dev
```

### 2) Frontend
```bash
cd Front
npm install
npm run dev
```

## Banco com Docker (opcional)
```bash
cd Back
docker compose up -d db
```

## Prisma
```bash
cd Back
npm run prisma -- migrate dev
npm run prisma -- generate
```

## Politica de versionamento
- Nao versionar `Back/data/postgres/` (dados locais do banco).
- Nao versionar arquivos `.env`.
- Versionar apenas `.env.example`.

