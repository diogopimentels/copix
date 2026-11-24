-- CreateEnum
CREATE TYPE "PapelMembro" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'PAGA', 'EXPIRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('RECEBIDO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "TipoProvedor" AS ENUM ('SIMULADOR');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('CREDITO', 'DEBITO');

-- CreateEnum
CREATE TYPE "StatusConciliacao" AS ENUM ('CONCILIADO', 'DIVERGENTE', 'PENDENTE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroOrganizacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "papel" "PapelMembro" NOT NULL DEFAULT 'OPERADOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembroOrganizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provedor" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoProvedor" NOT NULL DEFAULT 'SIMULADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "chaveWebhook" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobranca" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "vencimentoEm" TIMESTAMP(3),
    "pagoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "provedorId" TEXT NOT NULL,
    "cobrancaId" TEXT,
    "endToEndId" TEXT NOT NULL,
    "txid" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'RECEBIDO',
    "payloadBruto" JSONB NOT NULL,
    "recebidoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoWebhook" (
    "id" TEXT NOT NULL,
    "provedorId" TEXT NOT NULL,
    "assinatura" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processado" BOOLEAN NOT NULL DEFAULT false,
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "referenciaTipo" TEXT NOT NULL,
    "referenciaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conciliacao" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "cobrancaId" TEXT,
    "pagamentoId" TEXT,
    "status" "StatusConciliacao" NOT NULL DEFAULT 'PENDENTE',
    "motivoDivergencia" TEXT,
    "conciliadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conciliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "metadados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organizacao_documento_key" ON "Organizacao"("documento");

-- CreateIndex
CREATE INDEX "MembroOrganizacao_organizacaoId_idx" ON "MembroOrganizacao"("organizacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "MembroOrganizacao_usuarioId_organizacaoId_key" ON "MembroOrganizacao"("usuarioId", "organizacaoId");

-- CreateIndex
CREATE INDEX "Provedor_organizacaoId_idx" ON "Provedor"("organizacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Cobranca_txid_key" ON "Cobranca"("txid");

-- CreateIndex
CREATE INDEX "Cobranca_organizacaoId_status_idx" ON "Cobranca"("organizacaoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_endToEndId_key" ON "Pagamento"("endToEndId");

-- CreateIndex
CREATE INDEX "Pagamento_organizacaoId_idx" ON "Pagamento"("organizacaoId");

-- CreateIndex
CREATE INDEX "Pagamento_txid_idx" ON "Pagamento"("txid");

-- CreateIndex
CREATE INDEX "EventoWebhook_provedorId_processado_idx" ON "EventoWebhook"("provedorId", "processado");

-- CreateIndex
CREATE INDEX "Lancamento_organizacaoId_idx" ON "Lancamento"("organizacaoId");

-- CreateIndex
CREATE INDEX "Lancamento_referenciaTipo_referenciaId_idx" ON "Lancamento"("referenciaTipo", "referenciaId");

-- CreateIndex
CREATE INDEX "Conciliacao_organizacaoId_status_idx" ON "Conciliacao"("organizacaoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Conciliacao_cobrancaId_pagamentoId_key" ON "Conciliacao"("cobrancaId", "pagamentoId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_organizacaoId_criadoEm_idx" ON "RegistroAuditoria"("organizacaoId", "criadoEm");

-- AddForeignKey
ALTER TABLE "MembroOrganizacao" ADD CONSTRAINT "MembroOrganizacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroOrganizacao" ADD CONSTRAINT "MembroOrganizacao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provedor" ADD CONSTRAINT "Provedor_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_provedorId_fkey" FOREIGN KEY ("provedorId") REFERENCES "Provedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoWebhook" ADD CONSTRAINT "EventoWebhook_provedorId_fkey" FOREIGN KEY ("provedorId") REFERENCES "Provedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacao" ADD CONSTRAINT "Conciliacao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacao" ADD CONSTRAINT "Conciliacao_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacao" ADD CONSTRAINT "Conciliacao_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "Pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
