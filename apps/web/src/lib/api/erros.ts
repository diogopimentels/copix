export class ErroApi extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

export function extrairMensagemErro(corpo: unknown, fallback = 'Falha na requisição') {
  if (!corpo || typeof corpo !== 'object') return fallback;

  const mensagem = (corpo as { message?: unknown }).message;

  if (typeof mensagem === 'string') return mensagem;
  if (Array.isArray(mensagem)) return mensagem.join(', ');

  return fallback;
}
