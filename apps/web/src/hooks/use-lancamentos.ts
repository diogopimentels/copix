'use client';

import { useQuery } from '@tanstack/react-query';
import { lancamentosServico } from '@/lib/api';

export function useLancamentos(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['lancamentos', organizacaoId],
    queryFn: () => lancamentosServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function useResumoLancamentos(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['lancamentos', 'resumo', organizacaoId],
    queryFn: () => lancamentosServico.resumo(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}
