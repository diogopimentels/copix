'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizacoesServico } from '@/lib/api';
import { useOrganizacaoStore } from '@/stores/organizacao-store';

export function useOrganizacaoAtiva() {
  const organizacaoId = useOrganizacaoStore((s) => s.organizacaoId);
  const definirOrganizacaoId = useOrganizacaoStore((s) => s.definirOrganizacaoId);

  const consulta = useQuery({
    queryKey: ['organizacoes'],
    queryFn: () => organizacoesServico.listar(),
  });

  useEffect(() => {
    const lista = consulta.data;
    if (!lista?.length) return;

    const aindaExiste = organizacaoId
      ? lista.some((org) => org.id === organizacaoId)
      : false;

    if (!aindaExiste) {
      definirOrganizacaoId(lista[0]!.id);
    }
  }, [consulta.data, organizacaoId, definirOrganizacaoId]);

  const organizacao =
    consulta.data?.find((org) => org.id === organizacaoId) ?? consulta.data?.[0] ?? null;

  return {
    organizacaoId: organizacao?.id ?? null,
    organizacao,
    organizacoes: consulta.data ?? [],
    definirOrganizacaoId,
    isLoading: consulta.isLoading,
    isError: consulta.isError,
    error: consulta.error,
    refetch: consulta.refetch,
  };
}
