import type { RegistroAuditoria } from '@/types/dominio';
import { requisitarApi } from '../cliente';

export const auditoriaServico = {
  listar(organizacaoId: string) {
    return requisitarApi<RegistroAuditoria[]>(
      `/organizacoes/${organizacaoId}/auditoria`,
    );
  },
};
