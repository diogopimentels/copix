import type { Organizacao } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const organizacoesServico = {
  listar() {
    return requisitarApi<Organizacao[]>('/organizacoes');
  },

  obter(organizacaoId: string) {
    return requisitarApi<Organizacao>(`/organizacoes/${organizacaoId}`);
  },

  criar(dados: { nome: string; documento: string }) {
    return requisitarApi<Organizacao>('/organizacoes', {
      method: 'POST',
      body: dados,
    });
  },
};
