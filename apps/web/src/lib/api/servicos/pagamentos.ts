import type { Pagamento } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const pagamentosServico = {
  listar(organizacaoId: string) {
    return requisitarApi<Pagamento[]>(
      `/organizacoes/${organizacaoId}/pagamentos`,
    );
  },
};
