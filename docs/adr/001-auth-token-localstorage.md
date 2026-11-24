# ADR 001 — Persistência do JWT no frontend

## Status

Aceito temporariamente (Etapa 1). Revisão prevista na Etapa 4.

## Contexto

A API Nest devolve o JWT no body (`acesso.token`) e autentica via `Authorization: Bearer`.  
Não há cookie HttpOnly no backend hoje.

## Decisão

Manter o token no `localStorage` do browser e enviar Bearer nas chamadas do cliente.

## Consequências

- Prós: zero mudança de contrato na API; integração simples; MVP segue funcionando.
- Contras: qualquer XSS consegue ler o token.

## Alternativa futura

BFF no Next (`/api/auth/*`) que grava cookie `HttpOnly; Secure; SameSite=Lax` e proxya a API Nest, sem alterar o contrato atual do backend.
