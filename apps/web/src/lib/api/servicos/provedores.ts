import type { Provedor } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const provedoresServico = {
  listar(organizacaoId: string) {
    return requisitarApi<Provedor[]>(
      `/organizacoes/${organizacaoId}/provedores`,
    );
  },

  criar(organizacaoId: string, dados: { nome: string }) {
    return requisitarApi<Provedor>(
      `/organizacoes/${organizacaoId}/provedores`,
      {
        method: 'POST',
        body: dados,
      },
    );
  },
};
