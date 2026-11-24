**ARQUITETURA - MONÓLITO MODULAR**

Por que?

Escolhi monólito modular por se tratar de um projeto-demo, como não haverão muitos usuários simultaneamente, optei por unir todos os módulos nesta mesma aplicação por ser bem menos complexo de implementar.


**ÁRVORE DO PROJETO**

copix/
├── apps/
│   ├── api/                        # Backend NestJS (TypeScript strict)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Modelagem do banco
│   │   │   ├── migrations/         # Histórico de alterações no schema
│   │   │   └── seed.ts             # Dados de demonstração
│   │   ├── src/
│   │   │   ├── common/             # Filtros de erro, guards, decorators, logger
│   │   │   ├── config/             # Validação de variáveis de ambiente
│   │   │   └── modules/            # Módulos de domínio isolados
│   │   │       ├── auth/
│   │   │       ├── organizations/
│   │   │       ├── charges/
│   │   │       ├── payments/
│   │   │       ├── providers/
│   │   │       ├── webhooks/
│   │   │       ├── ledger/
│   │   │       ├── reconciliation/
│   │   │       └── audit/
│   │   └── test/                   # Testes de integração e E2E (Supertest)
│   └── web/                        # Frontend Next.js (App Router)
│       ├── src/
│       │   ├── app/                # Rotas e layouts
│       │   ├── components/         # UI kit (shadcn/ui) e componentes de domínio
│       │   ├── hooks/              # Hooks TanStack Query
│       │   ├── lib/                # Cliente HTTP, formatadores de moeda/data
│       │   └── schemas/            # Validações Zod
│       └── e2e/                    # Testes Playwright
├── docs/
│   ├── adr/                        # Architecture Decision Records
│   └── ARCHITECTURE.md             # Documentação arquitetural
├── .github/workflows/              # Pipeline CI (lint, typecheck, testes)
├── docker-compose.yml              # PostgreSQL + Redis
├── .env.example                    # Modelo de variáveis de ambiente
└── package.json                    # Workspaces config