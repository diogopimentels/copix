import type { Cobranca } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const cobrancasServico = {
  listar(organizacaoId: string) {
    return requisitarApi<Cobranca[]>(`/organizacoes/${organizacaoId}/cobrancas`);
  },

  obter(cobrancaId: string) {
    return requisitarApi<Cobranca>(`/cobrancas/${cobrancaId}`);
  },

  criar(
    organizacaoId: string,
    dados: { valorCentavos: number; descricao: string; vencimentoEm?: string },
  ) {
    return requisitarApi<Cobranca>(`/organizacoes/${organizacaoId}/cobrancas`, {
      method: 'POST',
      body: dados,
    });
  },
};
