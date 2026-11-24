'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizacoesServico, provedoresServico } from '@/lib/api';

export function useOrganizacaoDetalhe(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['organizacao', organizacaoId],
    queryFn: () => organizacoesServico.obter(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function useProvedores(organizacaoId: string | null) {
  return useQuery({
    queryKey: ['provedores', organizacaoId],
    queryFn: () => provedoresServico.listar(organizacaoId!),
    enabled: Boolean(organizacaoId),
  });
}

export function useCriarProvedor(organizacaoId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nome: string) =>
      provedoresServico.criar(organizacaoId!, { nome }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['provedores', organizacaoId] }),
        queryClient.invalidateQueries({ queryKey: ['organizacao', organizacaoId] }),
      ]);
    },
  });
}

export function useCriarOrganizacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: { nome: string; documento: string }) =>
      organizacoesServico.criar(dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['organizacoes'] });
    },
  });
}
