const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
const CHAVE_TOKEN = 'copix_token';

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

export async function chamarApi<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const token = lerToken();
  const headers = new Headers(opcoes.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`${URL_API}${caminho}`, {
    ...opcoes,
    headers,
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const mensagem =
      typeof corpo?.message === 'string'
        ? corpo.message
        : Array.isArray(corpo?.message)
          ? corpo.message.join(', ')
          : 'Falha na requisição';
    throw new Error(mensagem);
  }

  return corpo as T;
}

export function formatarMoeda(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(valor: string | Date) {
  return new Date(valor).toLocaleString('pt-BR');
}
