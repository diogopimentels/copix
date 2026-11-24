'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conciliacoesServico } from '@/lib/api';

export function useConciliacoes(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['conciliacoes', organizacaoId],
    queryFn: () => conciliacoesServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function usePainelConciliacao(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['conciliacoes', 'painel', organizacaoId],
    queryFn: () => conciliacoesServico.painel(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function useExecutarConciliacao(organizacaoId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conciliacoesServico.executar(organizacaoId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conciliacoes', organizacaoId] }),
        queryClient.invalidateQueries({
          queryKey: ['conciliacoes', 'painel', organizacaoId],
        }),
        queryClient.invalidateQueries({ queryKey: ['cobrancas', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', organizacaoId] }),
      ]);
    },
  });
}
