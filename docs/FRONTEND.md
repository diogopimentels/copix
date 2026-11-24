# Frontend Copix — fundação

## Identidade visual (Etapa 1)

- Light-first, SaaS financeiro.
- Tipografia: IBM Plex Sans (UI) + Fraunces (marca) + IBM Plex Mono (txid / ids).
- Accent: teal profundo (`hsl(168 78% 24%)`), sem neon e sem purple.
- Tokens em CSS variables + Tailwind v4 (`src/app/globals.css`).

## Stack instalada

- Next.js 15 / React 19 / TypeScript strict
- Tailwind CSS v4
- shadcn-style UI (`components/ui`)
- TanStack Query
- Zustand (só org selecionada)
- React Hook Form + Zod (schemas prontos)
- Sonner (toasts)

## Estrutura

```text
apps/web/src/
├── app/                 # rotas
├── components/
│   ├── ui/              # primitives
│   └── shared/          # empty/error states
├── features/            # (próximas etapas)
├── hooks/
├── lib/
│   ├── api/             # cliente + serviços por domínio
│   ├── utils/
│   └── validations/
├── providers/
├── stores/
└── types/
```

## Auth

JWT em `localStorage` por enquanto. Ver `docs/adr/001-auth-token-localstorage.md`.

## Scripts

```bash
npm run web:dev
npm run web:build
npm run web:lint
npm run web:typecheck
```
