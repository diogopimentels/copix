import type { RespostaAuth, Usuario } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const authServico = {
  entrar(dados: { email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/auth/entrar', {
      method: 'POST',
      body: dados,
      // credenciais inválidas também são 401; não pode matar a tela de login
      ignorarSessaoExpirada: true,
    });
  },

  registrar(dados: { nome: string; email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/auth/registrar', {
      method: 'POST',
      body: dados,
      ignorarSessaoExpirada: true,
    });
  },


  eu() {
    return requisitarApi<Usuario>('/auth/eu');
  },
};
