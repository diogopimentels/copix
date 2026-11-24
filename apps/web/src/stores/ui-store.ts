'use client';

import { create } from 'zustand';

type EstadoUi = {
  menuAberto: boolean;
  abrirMenu: () => void;
  fecharMenu: () => void;
  alternarMenu: () => void;
};

export const useUiStore = create<EstadoUi>((set) => ({
  menuAberto: false,
  abrirMenu: () => set({ menuAberto: true }),
  fecharMenu: () => set({ menuAberto: false }),
  alternarMenu: () => set((estado) => ({ menuAberto: !estado.menuAberto })),
}));
