# Frontend Copix

## Identidade

- Light content + sidebar grafite (fintech B2B)
- Tipografia: Inter (UI) + JetBrains Mono (valores/ids)
- Accent teal (`#0F766E`) com propósito; superfícies sem sombra decorativa
- Tokens em `app/globals.css`

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
- Auth: BFF Next (`/api/auth/*` + `/api/bff/*`) com cookie HttpOnly (ADR 001 superseded)
- Sessão: 401/403 limpa cookies, toast e redirect `/login`
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
