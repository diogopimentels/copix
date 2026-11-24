import { lerToken } from './auth-token';
import { ErroApi, extrairMensagemErro } from './erros';

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export type OpcoesRequisicao = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function requisitarApi<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const token = lerToken();
  const headers = new Headers(opcoes.headers);

  if (!headers.has('Content-Type') && opcoes.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`${URL_API}${caminho}`, {
    ...opcoes,
    headers,
    body:
      opcoes.body === undefined
        ? undefined
        : typeof opcoes.body === 'string'
          ? opcoes.body
          : JSON.stringify(opcoes.body),
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new ErroApi(extrairMensagemErro(corpo), resposta.status);
  }

  return corpo as T;
}
