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

      const seriePagamentos = [...pagamentos]
        .sort(
          (a, b) =>
            new Date(a.recebidoEm).getTime() - new Date(b.recebidoEm).getTime(),
        )
        .slice(-8)
        .map((pagamento) => ({
          data: new Date(pagamento.recebidoEm).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          valor: pagamento.valorCentavos / 100,
        }));

      return {
        resumo,
        painel,
        cobrancas,
        pagamentos,
        conciliacoes,
        totais: {
          cobrancas: cobrancas.length,
          pagamentos: pagamentos.length,
          cobrancasPendentes: cobrancas.filter((c) => c.status === 'PENDENTE').length,
          cobrancasPagas: cobrancas.filter((c) => c.status === 'PAGA').length,
        },
        seriePagamentos,
        recentes: {
          cobrancas: cobrancas.slice(0, 5),
          pagamentos: pagamentos.slice(0, 5),
          conciliacoes: conciliacoes.slice(0, 5),
        },
      };
    },
  });
}
