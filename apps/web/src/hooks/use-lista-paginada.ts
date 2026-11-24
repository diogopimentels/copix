'use client';

import { useMemo, useState } from 'react';

const LISTA_VAZIA: never[] = [];

/**
 * Pagina uma lista já filtrada no client.
 * Reinicie a página ao mudar filtros (reiniciarPagina / setPagina(1)).
 */
export function useListaPaginada<T>(itens: T[] | undefined, porPagina = 10) {
  const [pagina, setPagina] = useState(1);
  const lista = itens ?? (LISTA_VAZIA as T[]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina) || 1);
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);

  const fatia = useMemo(
    () => lista.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina),
    [lista, paginaAtual, porPagina],
  );

  function reiniciarPagina() {
    setPagina(1);
  }

  return {
    fatia,
    pagina: paginaAtual,
    totalPaginas,
    totalItens: lista.length,
    setPagina,
    reiniciarPagina,
  };
}
