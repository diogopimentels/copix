'use client';

import { useQuery } from '@tanstack/react-query';
import {
  cobrancasServico,
  conciliacoesServico,
  lancamentosServico,
  pagamentosServico,
} from '@/lib/api';

/**
 * Agrega a lista atual de pagamentos por dia civil (pt-BR).
 * Não é série histórica da API — limita-se aos itens retornados no listar.
 */
function seriePorDia(
  pagamentos: Array<{ recebidoEm: string; valorCentavos: number }>,
) {
  const mapa = new Map<string, { ordem: number; valor: number; rotulo: string }>();

  for (const pagamento of pagamentos) {
    const data = new Date(pagamento.recebidoEm);
    const chave = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
    const rotulo = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    const atual = mapa.get(chave);
    const valor = pagamento.valorCentavos / 100;
    if (atual) {
      atual.valor += valor;
    } else {
      mapa.set(chave, { ordem: data.getTime(), valor, rotulo });
    }
  }

  return [...mapa.values()]
    .sort((a, b) => a.ordem - b.ordem)
    .slice(-14)
    .map((item) => ({ data: item.rotulo, valor: item.valor }));
}

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
        cobrancas,
        pagamentos,
        conciliacoes,
        totais: {
          cobrancas: cobrancas.length,
          pagamentos: pagamentos.length,
          cobrancasPendentes: cobrancas.filter((c) => c.status === 'PENDENTE').length,
          cobrancasPagas: cobrancas.filter((c) => c.status === 'PAGA').length,
        },
        seriePagamentos: seriePorDia(pagamentos),
        recentes: {
          cobrancas: cobrancas.slice(0, 5),
          pagamentos: pagamentos.slice(0, 5),
          conciliacoes: conciliacoes.slice(0, 5),
        },
      };
    },
  });
}
