import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  _resetEncerrarSessaoFlag,
  encerrarSessaoPorStatus,
} from './sessao';

describe('encerrarSessaoPorStatus', () => {
  afterEach(() => {
    _resetEncerrarSessaoFlag();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('ignora status que não são 401/403', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const assign = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/dashboard',
      assign,
    });

    encerrarSessaoPorStatus(500);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('chama logout do BFF e redireciona em 401', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const assign = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/dashboard',
      assign,
    });

    encerrarSessaoPorStatus(401, 'Sessão inválida');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/sair', {
      method: 'POST',
      credentials: 'same-origin',
    });
    expect(assign).toHaveBeenCalledWith('/login');
  });
});
