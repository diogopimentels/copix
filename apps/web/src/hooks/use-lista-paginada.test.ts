import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useListaPaginada } from './use-lista-paginada';

describe('useListaPaginada', () => {
  it('fatia os itens e calcula total de páginas', () => {
    const itens = Array.from({ length: 25 }, (_, i) => i + 1);
    const { result } = renderHook(() => useListaPaginada(itens, 10));

    expect(result.current.totalPaginas).toBe(3);
    expect(result.current.fatia).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.totalItens).toBe(25);

    act(() => result.current.setPagina(2));
    expect(result.current.pagina).toBe(2);
    expect(result.current.fatia[0]).toBe(11);
  });

  it('reinicia para a primeira página', () => {
    const { result } = renderHook(() => useListaPaginada([1, 2, 3, 4], 2));
    act(() => result.current.setPagina(2));
    act(() => result.current.reiniciarPagina());
    expect(result.current.pagina).toBe(1);
  });
});
