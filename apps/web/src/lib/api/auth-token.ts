/**
 * Sinal de sessão legível pelo JS (cookie `copix_sessao=1`).
 * O JWT fica só no cookie HttpOnly `copix_acesso`, setado pelo BFF.
 */

const NOME_SINAL = 'copix_sessao';

function lerCookie(nome: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((parte) => parte.startsWith(`${nome}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

/** Indica se o BFF marcou sessão ativa (não contém o JWT). */
export function temSinalSessao() {
  return lerCookie(NOME_SINAL) === '1';
}

/** @deprecated use temSinalSessao — mantido pra não quebrar imports legados */
export function lerToken() {
  return temSinalSessao() ? 'cookie' : null;
}

/** No-op: o token real é gravado pelo route handler do BFF. */
export function salvarToken() {
  // cookie HttpOnly é setado em /api/auth/entrar|registrar
}

/** Pede ao BFF para apagar cookies de sessão. */
export async function limparToken() {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/auth/sair', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // redirect de sessão resolve a UX mesmo se o clear falhar
  }
}
