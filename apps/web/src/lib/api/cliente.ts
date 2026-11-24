import { ErroApi, extrairMensagemErro } from './erros';
import { encerrarSessaoPorStatus } from './sessao';

/** Browser fala só com o BFF Next; o Nest fica atrás do servidor. */
const URL_BFF = '/api/bff';

export type OpcoesRequisicao = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Quando true, não dispara logout automático em 401/403 (ex.: /auth/entrar). */
  ignorarSessaoExpirada?: boolean;
  /**
   * Base absoluta ou relativa. Auth BFF usa `/api/auth/...`;
   * demais chamadas usam `/api/bff`.
   */
  baseUrl?: string;
};

export async function requisitarApi<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const {
    ignorarSessaoExpirada,
    body,
    headers: headersOpcao,
    baseUrl = URL_BFF,
    ...rest
  } = opcoes;
  const headers = new Headers(headersOpcao);

  if (!headers.has('Content-Type') && body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const resposta = await fetch(`${baseUrl}${caminho}`, {
    ...rest,
    credentials: 'same-origin',
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
