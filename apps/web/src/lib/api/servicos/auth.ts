import type { RespostaAuth, Usuario } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const authServico = {
  entrar(dados: { email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/auth/entrar', {
      method: 'POST',
      body: dados,
    });
  },

  registrar(dados: { nome: string; email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/auth/registrar', {
      method: 'POST',
      body: dados,
    });
  },

  eu() {
    return requisitarApi<Usuario>('/auth/eu');
  },
};
