'use client';

import { useQuery } from '@tanstack/react-query';
import { auditoriaServico } from '@/lib/api';

export function useAuditoria(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['auditoria', organizacaoId],
    queryFn: () => auditoriaServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}
