# Copix

Conciliação financeira B2B de pagamentos Pix. Monólito modular com API NestJS + frontend Next.js.

## O que o MVP cobre

- cadastro/login com JWT
- organizações multi-tenant
- cobranças Pix (txid)
- webhook assinado (HMAC) + simulador de pagamento
- razão (lançamentos) e conciliação automática
- painel web pra operar o fluxo

## Subir local

Precisa de Node 20+, Docker e npm 10+ (o npm 9 do sistema quebra o install dos workspaces).

```bash
cp .env.example .env
docker compose up -d

# se o npm local for antigo:
npx npm@10 install

cd apps/api
export $(grep -v '^#' ../../.env | xargs)
npx prisma migrate deploy
npx tsx prisma/seed.ts
cd ../..

npm run api:dev
# noutro terminal
npm run web:dev
```

- API: http://localhost:3333
- Web: http://localhost:3000
- Login demo: `demo@copix.local` / `senha123`

Postgres sobe na porta **5433** e Redis na **6380** pra não bater com outros containers da máquina.

## Fluxo rápido

1. entra no painel com o usuário demo
2. cria uma cobrança
3. clica em **Simular Pix**
4. a cobrança vira `PAGA`, nasce o pagamento, o lançamento de crédito e a conciliação
