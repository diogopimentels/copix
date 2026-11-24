'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type EstadoOrganizacao = {
  organizacaoId: string | null;
  definirOrganizacaoId: (id: string | null) => void;
};

/** Estado de UI: organização selecionada no shell autenticado. */
export const useOrganizacaoStore = create<EstadoOrganizacao>()(
  persist(
    (set) => ({
      organizacaoId: null,
      definirOrganizacaoId: (id) => set({ organizacaoId: id }),
    }),
    { name: 'copix-organizacao' },
  ),
);
