# Copix

Plataforma B2B de conciliação financeira para pagamentos Pix.

O Copix resolve o caos de casar cobrança emitida × pagamento recebido × lançamento no razão, com trilha de auditoria. No MVP o provedor é um **simulador** assinado por HMAC — não há integração bancária real.

## Stack

| Camada | Tecnologia |
|---|---|
| API | NestJS 11, Prisma 6, PostgreSQL 16, JWT |
| Web | Next.js 15, React 19, TypeScript strict, Tailwind 4, shadcn-style UI |
| Dados no client | TanStack Query, Zustand (UI), Zod + React Hook Form |
| Qualidade | Vitest, Testing Library, Playwright, ESLint, GitHub Actions |
| Infra local | Docker Compose (Postgres 5433, Redis 6380) |

## Arquitetura

Monorepo npm workspaces (`apps/api`, `apps/web`). Monólito modular no backend; App Router no frontend com layouts `(auth)` e `(dashboard)`.

Fluxo principal:

```text
Login → Organização → Cobrança (txid)
  → Simular Pix / Webhook HMAC
  → Pagamento + crédito no razão + conciliação
```

## Funcionalidades

- Auth (login/registro) com JWT
- Multi-tenant por organização
- Cobranças Pix, pagamentos, conciliação (ok / pendente / divergente)
- Razão (lançamentos) e auditoria
- Configurações: org, provedores simulador, membros (leitura)
- Painel com indicadores e gráfico a partir de dados reais da API

## Subir local

Node 20+, Docker, npm 10+.

```bash
cp .env.example .env
docker compose up -d
npx npm@10 install

cd apps/api
export $(grep -v '^#' ../../.env | xargs)
npx prisma migrate deploy
npx tsx prisma/seed.ts
cd ../..

npm run api:dev
# outro terminal
npm run web:dev
```

- API: http://localhost:3333
- Web: http://localhost:3001
- Demo: `demo@copix.local` / `senha123`

## Qualidade

```bash
npm run web:lint
npm run web:typecheck
npm run web:test
npm run web:build

# E2E (API + web no ar)
npx playwright install chromium
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run web:test:e2e
```

## Documentação

- [`docs/ESTADO_ATUAL.md`](docs/ESTADO_ATUAL.md) — foto do MVP backend/front
- [`docs/FRONTEND.md`](docs/FRONTEND.md) — arquitetura frontend
- [`docs/adr/001-auth-token-localstorage.md`](docs/adr/001-auth-token-localstorage.md) — trade-off do JWT

## Observações honestas

- Provedor Pix atual = simulador
- JWT ainda em `localStorage` (ADR; BFF+cookie planejado)
- Listagens filtram/paginam no client; API ainda não tem query params
- Convite de membros não existe na API
