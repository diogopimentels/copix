# Copix — estado completo do projeto

Documento detalhado do que existe hoje no repositório.  
Atualizado em **24/11/2026**, branch `main` (pós BFF HttpOnly + UX listagens).

Complementa:

- [`ESTADO_ATUAL.md`](./ESTADO_ATUAL.md) — foto anterior do MVP
- [`FRONTEND.md`](./FRONTEND.md) — visão rápida do front
- [`adr/001-auth-token-localstorage.md`](./adr/001-auth-token-localstorage.md)

---

## 1. Visão do produto

O **Copix** é uma plataforma B2B de conciliação financeira para pagamentos Pix.

Problema que resolve: casar **cobrança emitida** × **pagamento recebido** × **lançamento no razão**, com trilha de auditoria e multi-tenant por organização.

No estágio atual o provedor Pix é um **simulador** com webhook HMAC. Não há PSP/banco real.

### Runtime validado agora

| Serviço | Endereço | Status |
|---|---|---|
| API Nest | http://localhost:3333 | ok (`GET /saude`) |
| Web Next | http://localhost:3001 | ok (`/login` = 200) |
| Postgres | `localhost:5433` | healthy (`copix-postgres`) |
| Redis | `localhost:6380` | healthy (container sobe; **ainda sem uso no código**) |

Credencial demo (seed):

- e-mail: `demo@copix.local`
- senha: `senha123`
- org: Mercado Demo LTDA (`12345678000199`)

---

## 2. Monorepo e infra

```text
copix/
├── apps/
│   ├── api/                 # NestJS 11 + Prisma
│   └── web/                 # Next.js 15 App Router
├── docs/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── package.json             # workspaces: apps/*
└── README.md
```

Scripts da raiz:

| Script | Função |
|---|---|
| `infra:up` / `down` / `logs` | Docker Compose |
| `api:dev` / `build` / `test` / `seed` / `migrate` | Backend |
| `web:dev` / `build` / `lint` / `typecheck` / `test` / `test:e2e` | Frontend |

Requisitos: Node `>=20`, npm `>=10` (npm 9 quebra workspaces).

Portas locais deliberadamente deslocadas para não conflitar com outros projetos da máquina:

- Postgres host `5433` → container `5432`
- Redis host `6380` → container `6379`
- API `3333`
- Web `3001`

---

## 3. Backend (`apps/api`) — detalhado

### 3.1 Stack

| Peça | Versão / escolha |
|---|---|
| Runtime | NestJS 11, TypeScript strict, CommonJS |
| ORM | Prisma 6 |
| Banco | PostgreSQL 16 |
| Auth | JWT (`@nestjs/jwt` + `passport-jwt`) |
| Hash | `bcryptjs` |
| Validação | `class-validator` / `class-transformer` |
| Config | `@nestjs/config` com validação em boot |

### 3.2 Estrutura de pastas

```text
apps/api/src/
├── main.ts                      # CORS, ValidationPipe, rawBody p/ HMAC
├── app.module.ts
├── config/ambiente.ts           # valida env obrigatório
├── prisma/                      # PrismaService global
├── common/
│   ├── decorators/              # @Publico, @UsuarioAtual
│   └── guards/                  # JwtAuthGuard (respeita rota pública)
└── modules/
    ├── auth/
    ├── organizacoes/
    ├── provedores/
    ├── cobrancas/
    ├── pagamentos/
    ├── webhooks/
    ├── lancamentos/
    ├── conciliacao/
    ├── auditoria/
    └── saude/
```

Convenção: nomes de domínio, enums, DTOs e rotas em **português**.

### 3.3 Modelo de dados (Prisma)

Entidades:

| Model | Papel |
|---|---|
| `Usuario` | conta (nome, email único, senhaHash) |
| `Organizacao` | tenant (nome, CNPJ único) |
| `MembroOrganizacao` | vínculo usuário↔org (`ADMIN` / `OPERADOR`) |
| `Provedor` | canal Pix (`SIMULADOR` + `chaveWebhook`) |
| `Cobranca` | cobrança com `txid` único |
| `Pagamento` | Pix recebido (`endToEndId` único) |
| `EventoWebhook` | log do payload + assinatura + erro |
| `Lancamento` | razão (`CREDITO` / `DEBITO`) |
| `Conciliacao` | pareamento cobrança×pagamento |
| `RegistroAuditoria` | trilha de ações |

Enums:

- `PapelMembro`: `ADMIN`, `OPERADOR`
- `StatusCobranca`: `PENDENTE`, `PAGA`, `EXPIRADA`, `CANCELADA`
- `StatusPagamento`: `RECEBIDO`, `ESTORNADO`
- `TipoProvedor`: `SIMULADOR`
- `TipoLancamento`: `CREDITO`, `DEBITO`
- `StatusConciliacao`: `CONCILIADO`, `DIVERGENTE`, `PENDENTE`

Valores monetários: sempre **centavos** (`valorCentavos: Int`).

Migration aplicada: `20261124181350_init`.

### 3.4 Autenticação e autorização

Fluxo:

1. `POST /auth/registrar` ou `POST /auth/entrar`
2. API devolve `{ usuario, acesso: { token, tipo: "Bearer", expiraEm } }`
3. Rotas protegidas exigem `Authorization: Bearer <jwt>`
4. `JwtStrategy` valida o token e carrega o usuário
5. `JwtAuthGuard` global por controller; `@Publico()` libera rota

Regras de tenant:

- quase tudo exige `organizacoesService.garantirMembro(organizacaoId, usuarioId)`
- criar organização já coloca o criador como `ADMIN` e cria provedor simulador com `chaveWebhook` aleatória

Não existe ainda:

- refresh token
- cookie HttpOnly no Nest
- convite/adição de membros via API
- RBAC fino por endpoint (ADMIN vs OPERADOR)

### 3.5 Catálogo de endpoints

Base: `http://localhost:3333`

#### Saúde
- `GET /saude` → `{ status, servico, horario }`

#### Auth
- `POST /auth/registrar` *(público)*  
  body: `{ nome, email, senha }`
- `POST /auth/entrar` *(público)*  
  body: `{ email, senha }`
- `GET /auth/eu` → perfil + membros/organizações

#### Organizações
- `POST /organizacoes` `{ nome, documento(14 dígitos) }`
- `GET /organizacoes`
- `GET /organizacoes/:organizacaoId`  
  inclui provedores, membros e `_count`

#### Provedores
- `GET /organizacoes/:organizacaoId/provedores`
- `POST /organizacoes/:organizacaoId/provedores` `{ nome }`

#### Cobranças
- `POST /organizacoes/:organizacaoId/cobrancas`  
  `{ valorCentavos, descricao, vencimentoEm? }`
- `GET /organizacoes/:organizacaoId/cobrancas`
- `GET /cobrancas/:cobrancaId`

#### Pagamentos
- `GET /organizacoes/:organizacaoId/pagamentos`

#### Webhooks / simulador
- `POST /webhooks/pix/:provedorId` *(público)*  
  header obrigatório: `x-copix-signature` = HMAC-SHA256 do body cru com `chaveWebhook`  
  body: `{ endToEndId, txid?, valorCentavos, horario? }`
- `POST /organizacoes/:organizacaoId/simulador/pagar`  
  `{ cobrancaId, valorCentavos? }`  
  monta payload, assina e reusa o processador do webhook

#### Lançamentos
- `GET /organizacoes/:organizacaoId/lancamentos`
- `GET /organizacoes/:organizacaoId/lancamentos/resumo`  
  → `{ creditoCentavos, debitoCentavos, saldoCentavos }`

#### Conciliação
- `GET /organizacoes/:organizacaoId/conciliacoes`
- `GET /organizacoes/:organizacaoId/conciliacoes/painel`  
  → `{ conciliadas, divergentes, pendentes, cobrancasPendentes, pagamentosSemPar }`
- `POST /organizacoes/:organizacaoId/conciliacoes/executar`  
  varredura de pares soltos por `txid`

#### Auditoria
- `GET /organizacoes/:organizacaoId/auditoria`  
  últimos 100 registros (com usuário quando houver)

### 3.6 Regras de negócio centrais

Quando um Pix entra (webhook ou simulador):

1. valida assinatura HMAC (timing-safe)
2. grava `EventoWebhook`
3. idempotência por `endToEndId`
4. cria `Pagamento`
5. cria `Lancamento` `CREDITO`
6. se achar cobrança pelo `txid`:
   - valores iguais → cobrança `PAGA` + conciliação `CONCILIADO`
   - valores diferentes → `DIVERGENTE` + motivo
7. sem cobrança → conciliação `PENDENTE`
8. registra auditoria (`WEBHOOK_PIX_PROCESSADO` / `PAGAMENTO_SIMULADO`)

`main.ts` guarda `rawBody` no Express para a assinatura bater com o corpo exato.

### 3.7 Seed

`apps/api/prisma/seed.ts` cria:

- usuário demo
- organização demo
- provedor simulador
- cobrança exemplo (se ainda não existir)

### 3.8 O que o backend ainda não faz

- query params de filtro/paginação/ordenação nas listagens
- uso de Redis (fila, cache, rate limit)
- estorno operacional completo via UI/API dedicada
- expiração automática de cobrança
- provedor Pix real
- testes automatizados densos na API (script existe, cobertura baixa)
- Dockerfile de produção da API

---

## 4. Frontend (`apps/web`) — detalhado

### 4.1 Stack

| Peça | Escolha |
|---|---|
| Framework | Next.js 15.5 (App Router) + React 19 |
| Linguagem | TypeScript strict + `noUncheckedIndexedAccess` |
| Estilo | Tailwind CSS v4 + tokens CSS + componentes estilo shadcn |
| Dados remotos | TanStack Query v5 |
| Estado de UI | Zustand (org ativa + menu mobile) |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Charts | Recharts (dynamic import, sem SSR) |
| Toasts | Sonner |
| Ícones | Lucide |
| Fontes | `next/font`: IBM Plex Sans / Fraunces / IBM Plex Mono |
| Testes | Vitest + Testing Library + Playwright |
| Qualidade | ESLint (next), Prettier, CI GitHub Actions |

Identidade visual: **light-first**, SaaS financeiro, accent teal profundo (`hsl(168 78% 24%)`), sem dark neon e sem purple genérico.

### 4.2 Estrutura

```text
apps/web/src/
├── app/
│   ├── layout.tsx                 # fonts + AppProviders
│   ├── page.tsx                   # redirect → /login
│   ├── painel/page.tsx            # redirect legado → /dashboard
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx             # GuardaAuth + Sidebar + Header
│       ├── dashboard/
│       ├── cobrancas/
│       ├── pagamentos/
│       ├── conciliacoes/
│       ├── lancamentos/
│       ├── auditoria/
│       └── configuracoes/
├── components/
│   ├── ui/                        # Button, Input, Card, Table, Badge...
│   ├── layout/                    # Sidebar, Header, GuardaAuth
│   └── shared/                    # PageHeader, Empty/Error, status badges
├── features/
│   ├── auth/                      # forms login/registro
│   ├── cobrancas/                 # form criar cobrança
│   └── dashboard/                 # gráfico
├── hooks/                         # TanStack Query por domínio
├── lib/
│   ├── api/                       # cliente HTTP + serviços tipados
│   ├── utils/                     # formatadores BRL/data/CNPJ
│   ├── validations/               # schemas Zod
│   └── navegacao.ts
├── providers/                     # QueryClient + Toaster
├── stores/                        # organizacao + ui
└── types/dominio.ts
```

### 4.3 Rotas da aplicação

| Rota | Grupo | Comportamento |
|---|---|---|
| `/` | - | redirect server-side para `/login` |
| `/login` | auth | RHF + Zod; redirect se já autenticado |
| `/registro` | auth | cria conta e entra |
| `/dashboard` | dashboard | KPIs, gráfico, recentes |
| `/cobrancas` | dashboard | criar, filtrar, paginar, simular Pix |
| `/pagamentos` | dashboard | histórico + busca |
| `/conciliacoes` | dashboard | painel + lista + executar varredura |
| `/lancamentos` | dashboard | extrato + resumo crédito/débito/saldo |
| `/auditoria` | dashboard | últimos eventos |
| `/configuracoes` | dashboard | conta, org, provedores, membros (leitura) |
| `/painel` | legado | redirect → `/dashboard` |

Layout autenticado:

- sidebar fixa no desktop / drawer no mobile
- header com seletor de organização + sair
- `GuardaAuth` bloqueia sem sinal de sessão (`copix_sessao`) ou com `/auth/eu` inválido

### 4.4 Camada de API no client

`lib/api/cliente.ts` → `requisitarApi<T>()`:

- base `/api/bff` (browser → Next → Nest)
- auth em `/api/auth/entrar|registrar|sair` (seta/limpa cookies)
- JWT só no cookie HttpOnly `copix_acesso`; Nest continua com Bearer
- lança `ErroApi` com status e mensagem do Nest

Serviços tipados:

- `authServico`
- `organizacoesServico`
- `cobrancasServico`
- `pagamentosServico`
- `conciliacoesServico`
- `lancamentosServico`
- `auditoriaServico`
- `provedoresServico`
- `simuladorServico`

Hooks (exemplos):

- `useEntrar` / `useRegistrar` / `usePerfil` / `useSair`
- `useOrganizacaoAtiva`
- `useDashboard`
- `useCobrancas` / `useCriarCobranca` / `useSimularPagamento`
- `usePagamentos`
- `useConciliacoes` / `usePainelConciliacao` / `useExecutarConciliacao`
- `useLancamentos` / `useResumoLancamentos`
- `useAuditoria`
- `useOrganizacaoDetalhe` / `useCriarOrganizacao` / `useCriarProvedor`

Invalidação de cache após mutações relevantes (ex.: simular Pix invalida cobranças, pagamentos, conciliações, lançamentos, dashboard, auditoria).

### 4.5 Telas — o que cada uma faz

#### Login / Registro
- validação tipada
- erros de API em toast
- demo credencial só como texto auxiliar (campos começam vazios)

#### Dashboard
- saldo do razão + taxa de conciliação (`painel`)
- atalhos “o que fazer agora” (divergências / pendentes)
- gráfico de pagamentos recentes (série client a partir da lista atual — documentado)
- tabelas das últimas cobranças e conciliações

#### Cobranças
- criar em dialog (Zod: descrição + valor BRL → centavos)
- detalhe via drawer (`GET /cobrancas/:id`)
- busca/filtro em `searchParams`, paginação client-side
- **Simular Pix** com `ConfirmDialog` + loading por linha

#### Pagamentos
- busca por end-to-end / txid / provedor (`?q=`)
- badge de status (`RECEBIDO` / `ESTORNADO`)
- paginação client-side + tabela responsiva

#### Conciliações
- cards do painel (conciliadas / pendentes / divergentes)
- coluna **delta**, motivo em evidência, drawer do par
- filtro `?status=` + paginação
- ação **Executar conciliação**

#### Lançamentos
- resumo crédito/débito/saldo
- filtro tipo + busca em `searchParams`
- extrato paginado

#### Auditoria
- busca por ação/entidade/usuário
- deixa claro que a API devolve no máx. 100 eventos
- paginação client-side

#### Configurações
- dados da conta
- criar organização (CNPJ 14 dígitos)
- listar provedores + `chaveWebhook` **mascarada** (copiar/revelar)
- criar novo simulador com confirmação
- membros **somente leitura** (API não tem invite)

### 4.6 Auth no browser (atual)

- BFF Next: cookies `copix_acesso` (HttpOnly) + `copix_sessao` (sinal UX)
- browser não guarda JWT em `localStorage`
- Nest intacto (`Authorization: Bearer` só no hop Next→API)
- ADR 001 marcado como superseded
- CSRF: SameSite=Lax + same-origin (sem token CSRF dedicado ainda)

### 4.7 Qualidade frontend

| Checagem | Situação |
|---|---|
| `web:lint` | passando |
| `web:typecheck` | passando |
| `web:test` (Vitest) | sessão, máscara, paginação, form, empty |
| `web:test:e2e` (Playwright) | 2 fluxos (login/nav + cobrança/simular/conciliar) |
| `web:build` | passando |
| CI | `.github/workflows/ci.yml` (lint, typecheck, test, build) |

E2E depende de API + web no ar:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run web:test:e2e
```

### 4.8 Decisões de renderização Next

- layouts e páginas de auth usam Server Components onde dá (metadata, shell)
- páginas de dashboard são Client Components (interatividade + Query)
- gráfico com `dynamic(..., { ssr: false })`
- painel autenticado **não** usa SSG de dados financeiros privados
- `/` e `/painel` são redirects server-side

### 4.9 O que o frontend ainda não tem / limitações honestas

- filtros/paginação só no client (API lista tudo)
- DateRangePicker dedicado ainda não entrou (vencimento usa `datetime-local`)
- sem token CSRF dedicado (SameSite=Lax cobre o caso same-site)
- sem dark mode productizado
- screenshots oficiais no README ainda não gerados
- convite de membros / permissões por papel na UI não existem porque a API não expõe

---

## 5. Fluxo ponta a ponta (como demonstrar)

```text
1. Abrir http://localhost:3001/login
2. Entrar com demo@copix.local / senha123
3. Dashboard carrega KPIs da org ativa
4. Ir em Cobranças → criar cobrança
5. Clicar Simular Pix
6. Cobrança vira PAGA
7. Pagamentos ganha end-to-end
8. Lançamentos ganha CREDITO
9. Conciliações ganha CONCILIADO (ou DIVERGENTE se valor diferente)
10. Auditoria registra a ação
```

Alternativa técnica sem UI: `POST /webhooks/pix/:provedorId` com HMAC da `chaveWebhook` do provedor.

---

## 6. Variáveis de ambiente

Arquivo modelo: `.env.example`

| Variável | Onde | Uso |
|---|---|---|
| `POSTGRES_*` / `POSTGRES_PORT` | compose | banco |
| `REDIS_PORT` | compose | redis host |
| `API_PORT` | api | porta Nest |
| `DATABASE_URL` | api/prisma | conexão |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | api | auth |
| `PIX_WEBHOOK_SECRET` | api | exigida no boot (assinatura real usa `chaveWebhook` do provedor) |
| `REDIS_HOST` | api | reservado |
| `NEXT_PUBLIC_API_URL` | web | base da API |

Web local também usa `apps/web/.env.local`.

---

## 7. Histórico recente de commits

```text
635ec4d docs: atualiza readme e arquitetura do frontend
b4ca37b test: adiciona vitest, playwright e pipeline de ci
d764f3e feat: entrega as telas do produto com dados da api
8acfe82 feat: sobe layout autenticado, sidebar e rotas de auth
e8fd818 feat: monta a fundação do frontend com tailwind e shadcn
a3caaf8 docs: documenta o estado atual do mvp
8148871 fix: sobe o front na 3001 porque a 3000 já tava ocupada
743e817 docs: explica como subir o projeto local
0e38a9f feat: adiciona o painel web do mvp
394752c feat: sobe a api com auth, cobranças e conciliação pix
6f48b92 chore: troca as portas do postgres/redis pra não conflitar
58bf2d1 chore: configura monorepo e infra
```

---

## 8. Mapa “pronto × próximo”

### Pronto
- monorepo + compose + seed
- API modular completa do MVP Pix
- webhook HMAC + simulador
- razão + conciliação + auditoria
- frontend SaaS com rotas, design system, Query, forms, testes e CI
- BFF Next + cookie HttpOnly (Nest intacto)
- listagens com primitives compartilhados + searchParams
- documentação operacional

### Próximos saltos naturais
1. paginação/filtros na API
2. token CSRF dedicado (se origem cross-site entrar no mapa)
3. Redis de verdade (fila de webhooks / cache)
4. testes de API + mais E2E
5. deploy (Dockerfiles + staging)
6. provedor Pix real (quando fizer sentido)

---

## 9. Resumo executivo

O Copix hoje é um **MVP full-stack demonstrável**:

- backend Nest com domínio financeiro real (ainda que com provedor simulado)
- frontend Next profissional o bastante para portfólio (arquitetura, tipagem, testes, CI)
- fluxo cobrança → pagamento → razão → conciliação fechado de ponta a ponta

Dá para apresentar em entrevista com honestidade: o que é simulador fica explícito; o que é engenharia (modelagem, conciliação, HMAC, multi-tenant, React/Next, qualidade) está implementado de verdade.
