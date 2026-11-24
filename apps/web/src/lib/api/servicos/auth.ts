import type { RespostaAuth, Usuario } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const authServico = {
  entrar(dados: { email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/entrar', {
      method: 'POST',
      body: dados,
      baseUrl: '/api/auth',
      // credenciais inválidas também são 401; não pode matar a tela de login
      ignorarSessaoExpirada: true,
    });
  },

  registrar(dados: { nome: string; email: string; senha: string }) {
    return requisitarApi<RespostaAuth>('/registrar', {
      method: 'POST',
      body: dados,
      baseUrl: '/api/auth',
      ignorarSessaoExpirada: true,
    });
  },

  eu() {
    return requisitarApi<Usuario>('/auth/eu');
  },

  sair() {
    return requisitarApi<{ ok: boolean }>('/sair', {
      method: 'POST',
      baseUrl: '/api/auth',
      ignorarSessaoExpirada: true,
    });
  },
};
