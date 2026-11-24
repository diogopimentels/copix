import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

/** Cookie HttpOnly com o JWT — inacessível ao JS do browser. */
export const NOME_COOKIE_TOKEN = 'copix_acesso';

/**
 * Sinal não-secreto de “há sessão”.
 * Só para UX (habilitar usePerfil / GuardaAuth) — o JWT real fica no HttpOnly.
 */
export const NOME_COOKIE_SINAL = 'copix_sessao';

const MAX_AGE_SEGUNDOS = 60 * 60 * 24; // 1d — alinhado ao JWT_EXPIRES_IN padrão

export function opcoesCookieToken(maxAge = MAX_AGE_SEGUNDOS) {
  const seguro = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: seguro,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function opcoesCookieSinal(maxAge = MAX_AGE_SEGUNDOS) {
  const seguro = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: seguro,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function lerTokenDoCookie() {
  const jar = await cookies();
  return jar.get(NOME_COOKIE_TOKEN)?.value ?? null;
}

/** Grava JWT HttpOnly + sinal legível na resposta do route handler. */
export function anexarSessaoNaResposta(resposta: NextResponse, token: string) {
  resposta.cookies.set(NOME_COOKIE_TOKEN, token, opcoesCookieToken());
  resposta.cookies.set(NOME_COOKIE_SINAL, '1', opcoesCookieSinal());
  return resposta;
}

export function anexarLimpezaNaResposta(resposta: NextResponse) {
  resposta.cookies.set(NOME_COOKIE_TOKEN, '', { ...opcoesCookieToken(), maxAge: 0 });
  resposta.cookies.set(NOME_COOKIE_SINAL, '', { ...opcoesCookieSinal(), maxAge: 0 });
  return resposta;
}

export async function limparSessaoCookie() {
  const jar = await cookies();
  jar.delete(NOME_COOKIE_TOKEN);
  jar.delete(NOME_COOKIE_SINAL);
}

export function urlApiInterna() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3333'
  );
}
