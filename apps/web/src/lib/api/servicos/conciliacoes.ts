import type { Conciliacao, PainelConciliacao } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const conciliacoesServico = {
  listar(organizacaoId: string) {
    return requisitarApi<Conciliacao[]>(
      `/organizacoes/${organizacaoId}/conciliacoes`,
    );
  },

  painel(organizacaoId: string) {
    return requisitarApi<PainelConciliacao>(
      `/organizacoes/${organizacaoId}/conciliacoes/painel`,
    );
  },

  executar(organizacaoId: string) {
    return requisitarApi<{ paresCriados: number; itens: Conciliacao[] }>(
      `/organizacoes/${organizacaoId}/conciliacoes/executar`,
      { method: 'POST' },
    );
  },
};
