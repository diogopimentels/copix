import { lerToken } from './auth-token';
import { ErroApi, extrairMensagemErro } from './erros';
import { encerrarSessaoPorStatus } from './sessao';

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export type OpcoesRequisicao = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Quando true, não dispara logout automático em 401/403 (ex.: /auth/entrar). */
  ignorarSessaoExpirada?: boolean;
};

export async function requisitarApi<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const { ignorarSessaoExpirada, body, headers: headersOpcao, ...rest } = opcoes;
  const token = lerToken();
  const headers = new Headers(headersOpcao);

  if (!headers.has('Content-Type') && body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`${URL_API}${caminho}`, {
    ...rest,
    headers,
    body:
      body === undefined
        ? undefined
        : typeof body === 'string'
          ? body
          : JSON.stringify(body),
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const mensagem = extrairMensagemErro(corpo);

    if (!ignorarSessaoExpirada) {
      encerrarSessaoPorStatus(resposta.status, mensagem);
    }

    throw new ErroApi(mensagem, resposta.status);
  }

  return corpo as T;
}
