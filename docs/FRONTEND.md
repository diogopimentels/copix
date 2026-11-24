# Frontend Copix

## Identidade

- Light-first, SaaS financeiro
- Tipografia: IBM Plex Sans + Fraunces (marca) + IBM Plex Mono (ids)
- Accent teal profundo (`hsl(168 78% 24%)`)

## Rotas

| Rota | Grupo | Função |
|---|---|---|
| `/` | - | redirect → `/login` |
| `/login` | auth | login |
| `/registro` | auth | registro |
| `/dashboard` | dashboard | indicadores + gráfico |
| `/cobrancas` | dashboard | CRUD leve + simular Pix |
| `/pagamentos` | dashboard | histórico |
| `/conciliacoes` | dashboard | pareamento + varredura |
| `/lancamentos` | dashboard | extrato do razão |
| `/auditoria` | dashboard | trilha de ações |
| `/configuracoes` | dashboard | org, provedores, membros |
| `/painel` | - | redirect legado → `/dashboard` |

## Estrutura

```text
src/
├── app/(auth) (dashboard)
├── components/ui|layout|shared
├── features/auth|cobrancas|dashboard
├── hooks/          # TanStack Query por domínio
├── lib/api|utils|validations
├── providers/
├── stores/         # org ativa + menu mobile
└── types/
```

## Dados

- Servidor: TanStack Query (`useCobrancas`, `useDashboard`, …)
- UI global: Zustand (`organizacaoId`, menu)
- Forms: React Hook Form + Zod
- Auth: Bearer + `localStorage` (ADR 001)
- Sessão: `requisitarApi` encerra sessão em 401/403 (toast + redirect `/login`)
- Listagens: filtro/paginação no **client** (`useListaPaginada` + `searchParams`); série do dashboard documentada como “últimos N da lista atual”
- Segredos: `chaveWebhook` mascarada por padrão (`SegredoMascarado`)
- Ações sensíveis: `ConfirmDialog` (simular Pix, criar provedor)

## Scripts

```bash
npm run web:dev
npm run web:lint
npm run web:typecheck
npm run web:test
npm run web:test:e2e
npm run web:build
```
