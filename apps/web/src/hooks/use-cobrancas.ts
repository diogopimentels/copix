'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cobrancasServico, simuladorServico } from '@/lib/api';

export function useCobrancas(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['cobrancas', organizacaoId],
    queryFn: () => cobrancasServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function useCriarCobranca(organizacaoId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: {
      valorCentavos: number;
      descricao: string;
      vencimentoEm?: string;
    }) => cobrancasServico.criar(organizacaoId!, dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cobrancas', organizacaoId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', organizacaoId] });
    },
  });
}

export function useSimularPagamento(organizacaoId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cobrancaId: string) =>
      simuladorServico.pagar(organizacaoId!, { cobrancaId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cobrancas', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['pagamentos', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['conciliacoes', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['lancamentos', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['auditoria', organizacaoId] }),
      ]);
    },
  });
}
