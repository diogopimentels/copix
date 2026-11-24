import type { Lancamento, ResumoLancamentos } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const lancamentosServico = {
  listar(organizacaoId: string) {
    return requisitarApi<Lancamento[]>(
      `/organizacoes/${organizacaoId}/lancamentos`,
    );
  },

  resumo(organizacaoId: string) {
    return requisitarApi<ResumoLancamentos>(
      `/organizacoes/${organizacaoId}/lancamentos/resumo`,
    );
  },
};
