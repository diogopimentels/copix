'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authServico, limparToken, temSinalSessao } from '@/lib/api';
import type { DadosEntrar, DadosRegistrar } from '@/lib/validations/auth';

export function usePerfil() {
  return useQuery({
    queryKey: ['auth', 'eu'],
    queryFn: () => authServico.eu(),
    enabled: typeof window !== 'undefined' && temSinalSessao(),
    retry: false,
  });
}

export function useEntrar() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosEntrar) => authServico.entrar(dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.replace('/dashboard');
    },
  });
}

export function useRegistrar() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosRegistrar) => authServico.registrar(dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.replace('/dashboard');
    },
  });
}

export function useSair() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    void limparToken().finally(() => {
      queryClient.clear();
      router.replace('/login');
    });
  };
}
