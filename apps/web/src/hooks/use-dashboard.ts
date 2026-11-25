'use client';

import { useQuery } from '@tanstack/react-query';
import {
  cobrancasServico,
  conciliacoesServico,
  lancamentosServico,
  pagamentosServico,
} from '@/lib/api';

export function useDashboard(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['dashboard', organizacaoId],
    enabled: Boolean(organizacaoId),
    queryFn: async () => {
      const [resumo, painel, cobrancas, pagamentos, conciliacoes] = await Promise.all([
        lancamentosServico.resumo(organizacaoId!),
        conciliacoesServico.painel(organizacaoId!),
        cobrancasServico.listar(organizacaoId!),
        pagamentosServico.listar(organizacaoId!),
        conciliacoesServico.listar(organizacaoId!),
      ]);

      return {
        resumo,
        painel,
        totais: {
          cobrancas: cobrancas.length,
          pagamentos: pagamentos.length,
          cobrancasPendentes: cobrancas.filter((c) => c.status === 'PENDENTE').length,
          cobrancasPagas: cobrancas.filter((c) => c.status === 'PAGA').length,
        },
        recentes: {
          cobrancas: cobrancas.slice(0, 5),
          pagamentos: pagamentos.slice(0, 5),
          conciliacoes: conciliacoes.slice(0, 5),
        },
      };
    },
  });
}
