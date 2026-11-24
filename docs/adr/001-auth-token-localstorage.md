# ADR 001 — Persistência do JWT no frontend

## Status

**Superseded** pela autenticação via BFF + cookie HttpOnly (nov/2026).

## Contexto

A API Nest devolve o JWT no body (`acesso.token`) e autentica via `Authorization: Bearer`.  
Não há cookie HttpOnly no backend Nest.

## Decisão original (temporária)

Manter o token no `localStorage` do browser e enviar Bearer nas chamadas do cliente.

## Decisão atual

BFF no Next.js:

| Rota | Papel |
|---|---|
| `POST /api/auth/entrar` | proxy Nest + seta cookies |
| `POST /api/auth/registrar` | proxy Nest + seta cookies |
| `POST /api/auth/sair` | limpa cookies |
| `/api/bff/*` | proxy autenticado; injeta `Authorization: Bearer` a partir do cookie |

Cookies:

- `copix_acesso` — JWT, **HttpOnly; SameSite=Lax; Secure em production**
- `copix_sessao=1` — sinal não-secreto legível pelo JS (só UX)

O browser **não** recebe o JWT no JSON de login/registro.  
O contrato Nest permanece igual; só a superfície web muda.

## Consequências

- Prós: XSS não consegue ler o JWT; Nest intacto; CORS do browser só fala com a origem Next.
- Contras: toda chamada autenticada passa pelo Next (latência/carga); CSRF mitigado por SameSite=Lax + same-origin (sem token CSRF dedicado ainda).
- XSS ainda pode abusar da sessão via requests same-origin — ameaça residual aceita.

## Alternativas descartadas nesta rodada

- Nest emitir cookie direto (mudaria o contrato e CORS de produção).
- Manter Bearer no `localStorage` (risco XSS de exfiltração do token).
