'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Lê/escreve um filtro opcional em searchParams (replace, sem empilhar history).
 */
export function useParametroBusca(chave: string, padrao = '') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const valor = searchParams.get(chave) ?? padrao;

  const setValor = useCallback(
    (proximo: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!proximo || proximo === padrao) {
        params.delete(chave);
      } else {
        params.set(chave, proximo);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [chave, padrao, pathname, router, searchParams],
  );

  return [valor, setValor] as const;
}
