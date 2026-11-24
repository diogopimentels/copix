const CHAVE_TOKEN = 'copix_token';

/**
 * Persistência atual: localStorage + Bearer.
 * Trade-off documentado: XSS consegue ler o token.
 * Evolução prevista (Etapa 4): BFF Next com cookie HttpOnly.
 */
export function salvarToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function lerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CHAVE_TOKEN);
}

export function limparToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAVE_TOKEN);
}
