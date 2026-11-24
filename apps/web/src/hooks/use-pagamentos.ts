'use client';

import { useQuery } from '@tanstack/react-query';
import { pagamentosServico } from '@/lib/api';

export function usePagamentos(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['pagamentos', organizacaoId],
    queryFn: () => pagamentosServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}
