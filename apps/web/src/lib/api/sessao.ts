import { limparToken } from './auth-token';

let redirecionandoSessao = false;

/**
 * Encerra a sessão no browser quando a API responde 401/403.
 * Evita loops se várias requests falharem ao mesmo tempo.
 */
export function encerrarSessaoPorStatus(status: number, mensagem?: string) {
  if (status !== 401 && status !== 403) return;
  if (typeof window === 'undefined') return;
  if (redirecionandoSessao) return;

  redirecionandoSessao = true;
  limparToken();

  try {
    // import dinâmico evita acoplar sonner no bundle de server
    void import('sonner').then(({ toast }) => {
      toast.error(
        mensagem && mensagem.trim()
          ? mensagem
          : status === 401
            ? 'Sessão expirada. Entre de novo.'
            : 'Sem permissão para esta ação.',
      );
    });
  } catch {
    // silencioso: o redirect já resolve a UX
  }

  const destino = '/login';
  if (window.location.pathname !== destino) {
    window.location.assign(destino);
  } else {
    redirecionandoSessao = false;
  }
}

/** Só para testes */
export function _resetEncerrarSessaoFlag() {
  redirecionandoSessao = false;
}
