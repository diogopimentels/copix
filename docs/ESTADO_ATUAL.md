# Copix — estado atual do projeto

Documento de referência do que existe hoje no repositório (branch `main`, commit `8148871`).  
Atualizado em 24/11/2026.

---

## 1. Visão geral

O **Copix** é uma plataforma B2B de conciliação financeira para pagamentos Pix.

O MVP já roda ponta a ponta:

1. usuário autentica
2. cria/gerencia organização
3. emite cobrança Pix (`txid`)
4. recebe pagamento via webhook assinado (ou simulador)
5. gera lançamento no razão
6. concilia cobrança × pagamento
7. acompanha tudo no painel web

É um **monólito modular** em monorepo npm workspaces:

| App | Stack | Papel |
|---|---|---|
| `apps/api` | NestJS 11 + Prisma + PostgreSQL | Backend / domínio |
| `apps/web` | Next.js 15 (App Router) + React 19 | Painel operacional |
| Docker Compose | Postgres 16 + Redis 7 | Infra local |

Redis sobe na infra, mas **ainda não tem fila/cache ligado no código da API**. Ficou preparado pro próximo passo.

---

## 2. Como está rodando agora

Ambiente local validado:

| Serviço | URL / porta | Status |
|---|---|---|
| API | http://localhost:3333 | ok (`GET /saude`) |
| Web | http://localhost:3001 | ok |
| Postgres | `localhost:5433` | healthy (`copix-postgres`) |
| Redis | `localhost:6380` | healthy (`copix-redis`) |

Credencial de demonstração (seed):

- e-mail: `demo@copix.local`
- senha: `senha123`
- organização: `Mercado Demo LTDA` (CNPJ `12345678000199`)

Repositório remoto: `git@github.com:diogopimentels/copix.git`

---

## 3. Estrutura real do repositório

```text
copix/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/20261124181350_init/
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── common/          # decorators e JwtAuthGuard
│   │       ├── config/          # validação de env
│   │       ├── prisma/          # PrismaService global
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       └── modules/
│   │           ├── auth/
│   │           ├── organizacoes/
│   │           ├── provedores/
│   │           ├── cobrancas/
│   │           ├── pagamentos/
│   │           ├── webhooks/
│   │           ├── lancamentos/
│   │           ├── conciliacao/
│   │           ├── auditoria/
│   │           └── saude/
│   └── web/
│       └── src/
│           ├── app/
│           │   ├── page.tsx          # login/registro
│           │   ├── painel/page.tsx   # operação do MVP
│           │   ├── layout.tsx
│           │   └── globals.css
│           └── lib/
│               ├── api.ts            # client HTTP + token
│               └── tipos.ts
├── docs/
│   ├── ARQUITETURA.md               # intenção inicial
│   └── ESTADO_ATUAL.md              # este documento
├── docker-compose.yml
├── .env.example
├── package.json                     # workspaces
└── README.md
```

### Diferença pro desenho antigo (`docs/ARQUITETURA.md`)

O ADR/árvore inicial falava em pastas em inglês (`organizations`, `charges`, `ledger`…) e em peças ainda não feitas (shadcn, TanStack Query, Playwright, CI GitHub Actions).

No código de verdade:

- pastas e nomes de domínio estão em **português**
- front é enxuto (sem shadcn/TanStack/Playwright ainda)
- não há `.github/workflows` ainda
- pastas `docs/adr` e `docs/diagrams` existem vazias

---

## 4. Stack e decisões técnicas

### Backend (`apps/api`)

- NestJS 11 (CommonJS, TypeScript strict)
- Prisma 6 + PostgreSQL
- Auth JWT (`@nestjs/jwt` + `passport-jwt`)
- Validação com `class-validator` / `class-transformer`
- Senha com `bcryptjs`
- Webhook Pix com HMAC-SHA256 (`x-copix-signature`)
- Valores monetários em **centavos** (`valorCentavos`)
- Nomes de variáveis, enums, models e rotas em português

### Frontend (`apps/web`)

- Next.js 15 App Router
- React 19
- Token JWT no `localStorage` (`copix_token`)
- Duas rotas: `/` (auth) e `/painel` (operação)
- UI própria (CSS global), sem design system externo

### Monorepo

- npm workspaces (`apps/*`)
- Node `>=20`
- npm `>=10` (npm 9 quebra o install com o bug `edgesOut`)

---

## 5. Modelo de dados (Prisma)

Entidades principais:

| Model | Função |
|---|---|
| `Usuario` | conta de acesso |
| `Organizacao` | tenant (CNPJ único) |
| `MembroOrganizacao` | vínculo usuário ↔ org (`ADMIN` / `OPERADOR`) |
| `Provedor` | canal Pix (hoje só `SIMULADOR`) |
| `Cobranca` | cobrança emitida com `txid` |
| `Pagamento` | Pix recebido (`endToEndId`) |
| `EventoWebhook` | log do payload + assinatura |
| `Lancamento` | razão (`CREDITO` / `DEBITO`) |
| `Conciliacao` | pareamento cobrança × pagamento |
| `RegistroAuditoria` | trilha de ações |

Enums em uso:

- `PapelMembro`: `ADMIN`, `OPERADOR`
- `StatusCobranca`: `PENDENTE`, `PAGA`, `EXPIRADA`, `CANCELADA`
- `StatusPagamento`: `RECEBIDO`, `ESTORNADO`
- `TipoProvedor`: `SIMULADOR`
- `TipoLancamento`: `CREDITO`, `DEBITO`
- `StatusConciliacao`: `CONCILIADO`, `DIVERGENTE`, `PENDENTE`

Migration aplicada: `20261124181350_init`.

---

## 6. Fluxo de domínio (como o MVP funciona)

```text
[Usuário]
   │ registra/entra (JWT)
   ▼
[Organização] ──cria──► [Provedor SIMULADOR] (chaveWebhook)
   │
   ├── cria Cobrança (txid, valorCentavos, PENDENTE)
   │
   ├── Simular Pix  ──ou──  POST /webhooks/pix/:provedorId
   │         │
   │         ▼
   │      valida HMAC
   │         │
   │         ▼
   │      Pagamento (RECEBIDO)
   │         │
   │         ├── Lancamento CREDITO
   │         ├── Cobrança → PAGA (se valor bater)
   │         └── Conciliacao CONCILIADO / DIVERGENTE / PENDENTE
   │
   └── Painel mostra saldo, cobranças, pagamentos e conciliações
```

Regras principais:

- match principal por `txid`
- se valores forem iguais → `CONCILIADO` e cobrança `PAGA`
- se valores divergirem → `DIVERGENTE`
- se não achar cobrança → conciliação `PENDENTE`
- idempotência de pagamento por `endToEndId`
- corpo cru do request é preservado pra assinar/validar HMAC

---

## 7. API — endpoints atuais

Base: `http://localhost:3333`  
Auth: header `Authorization: Bearer <token>` (exceto rotas públicas)

### Saúde
- `GET /saude`

### Auth
- `POST /auth/registrar` *(público)*
- `POST /auth/entrar` *(público)*
- `GET /auth/eu`

### Organizações
- `POST /organizacoes`
- `GET /organizacoes`
- `GET /organizacoes/:organizacaoId`

Ao criar organização, o sistema já cria um provedor simulador com `chaveWebhook`.

### Provedores
- `GET /organizacoes/:organizacaoId/provedores`
- `POST /organizacoes/:organizacaoId/provedores`

### Cobranças
- `POST /organizacoes/:organizacaoId/cobrancas`
- `GET /organizacoes/:organizacaoId/cobrancas`
- `GET /cobrancas/:cobrancaId`

Body de criação:

```json
{
  "valorCentavos": 2990,
  "descricao": "Pedido 1001",
  "vencimentoEm": "2026-12-01T23:59:59.000Z"
}
```

### Pagamentos
- `GET /organizacoes/:organizacaoId/pagamentos`

### Webhooks / simulador
- `POST /webhooks/pix/:provedorId` *(público, exige `x-copix-signature`)*
- `POST /organizacoes/:organizacaoId/simulador/pagar`

Payload Pix esperado:

```json
{
  "endToEndId": "E123...",
  "txid": "copix...",
  "valorCentavos": 2990,
  "horario": "2026-11-24T18:00:00.000Z"
}
```

Assinatura: HMAC-SHA256 do body cru com a `chaveWebhook` do provedor.

### Lançamentos
- `GET /organizacoes/:organizacaoId/lancamentos`
- `GET /organizacoes/:organizacaoId/lancamentos/resumo`

### Conciliação
- `GET /organizacoes/:organizacaoId/conciliacoes`
- `GET /organizacoes/:organizacaoId/conciliacoes/painel`
- `POST /organizacoes/:organizacaoId/conciliacoes/executar`

### Auditoria
- `GET /organizacoes/:organizacaoId/auditoria`

---

## 8. Frontend — o que a UI faz

### `/`
- login e registro
- grava JWT e manda pro painel
- formulário já vem pré-preenchido com o usuário demo

### `/painel`
- troca/cria organização
- cards: saldo do razão, conciliadas, divergentes
- cria cobrança
- botão **Simular Pix**
- lista pagamentos e conciliações
- botão **Rodar conciliação** (varredura de pares soltos)

Ainda não tem:
- tela dedicada de auditoria
- gestão visual de provedores
- componentes/shadcn
- testes E2E

---

## 9. Variáveis de ambiente

Arquivo modelo: `.env.example`

| Variável | Uso |
|---|---|
| `POSTGRES_USER` / `PASSWORD` / `DB` | container Postgres |
| `POSTGRES_PORT` | host local (`5433`) |
| `REDIS_PORT` | host local (`6380`) |
| `API_PORT` | porta da API (`3333`) |
| `DATABASE_URL` | conexão Prisma |
| `REDIS_HOST` | host Redis (reservado) |
| `JWT_SECRET` | assinatura JWT (>= 32 chars) |
| `JWT_EXPIRES_IN` | validade do token (`1d`) |
| `PIX_WEBHOOK_SECRET` | segredo auxiliar no env (validação de boot) |
| `NEXT_PUBLIC_API_URL` | base URL usada pelo web |

O front também usa `apps/web/.env.local` com `NEXT_PUBLIC_API_URL`.

---

## 10. Scripts úteis

Na raiz:

```bash
npm run infra:up
npm run infra:down
npm run infra:logs
npm run api:dev
npm run api:build
npm run api:migrate
npm run api:seed
npm run web:dev
npm run web:build
```

Setup completo:

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
npm run web:dev
```

---

## 11. Histórico recente de commits

```text
8148871 fix: sobe o front na 3001 porque a 3000 já tava ocupada
743e817 docs: explica como subir o projeto local
0e38a9f feat: adiciona o painel web do mvp
394752c feat: sobe a api com auth, cobranças e conciliação pix
6f48b92 chore: troca as portas do postgres/redis pra não conflitar
58bf2d1 chore: configura monorepo e infra
```

---

## 12. O que já está pronto vs o que falta

### Pronto no MVP
- monorepo + compose
- schema/migration/seed
- auth JWT
- multi-tenant por organização
- cobrança Pix
- webhook HMAC + simulador
- razão e conciliação
- painel operacional básico
- documentação de setup

### Ainda não feito
- uso real do Redis (fila Bull/BullMQ, cache, rate limit)
- provedor Pix real (além do simulador)
- estorno completo no fluxo de UI
- expiração automática de cobrança
- CI (lint/typecheck/test)
- testes automatizados de verdade (API/E2E)
- ADRs preenchidos / diagramas
- polish de UI (componentização, shadcn, query client)
- deploy (Dockerfile da API/web, staging, etc.)
- convite de membros pra organização (hoje só o criador entra como ADMIN)

---

## 13. Riscos / observações práticas

1. **npm 9** do sistema quebra `npm install` nos workspaces → usar npm 10 (`npx npm@10 install`).
2. Portas locais foram deslocadas de propósito (`5433`, `6380`, `3001`) pra não brigar com outros projetos na máquina.
3. O secret do webhook usado na validação de assinatura é a `chaveWebhook` do provedor, não o `PIX_WEBHOOK_SECRET` global.
4. Token no browser fica em `localStorage` (ok pra demo; pra produção avaliar cookie httpOnly).
5. `docs/ARQUITETURA.md` descreve a intenção inicial; este arquivo descreve o estado real.

---

## 14. Resumo executivo

O Copix saiu do scaffold quebrado e virou um MVP funcional de conciliação Pix:

- API modular em português
- banco modelado e migrado
- fluxo cobrança → pagamento → razão → conciliação fechado
- painel web operável
- seed e instruções de setup no ar

Dá pra demonstrar o produto localmente hoje. Os próximos saltos naturais são Redis/filas, provedor real, testes/CI e endurecimento pra produção.
