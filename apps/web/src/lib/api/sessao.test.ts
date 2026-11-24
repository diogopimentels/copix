import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  _resetEncerrarSessaoFlag,
  encerrarSessaoPorStatus,
} from './sessao';

describe('encerrarSessaoPorStatus', () => {
  afterEach(() => {
    _resetEncerrarSessaoFlag();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('ignora status que não são 401/403', () => {
    localStorage.setItem('copix_token', 'abc');
    const assign = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/dashboard',
      assign,
    });

    encerrarSessaoPorStatus(500);
    expect(localStorage.getItem('copix_token')).toBe('abc');
    expect(assign).not.toHaveBeenCalled();
  });

  it('limpa token e redireciona em 401', () => {
    localStorage.setItem('copix_token', 'abc');
    const assign = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/dashboard',
      assign,
    });

    encerrarSessaoPorStatus(401, 'Sessão inválida');
    expect(localStorage.getItem('copix_token')).toBeNull();
    expect(assign).toHaveBeenCalledWith('/login');
  });
});
