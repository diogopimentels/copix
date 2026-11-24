'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
  carregando?: boolean;
  tom?: 'default' | 'destructive';
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  confirmarLabel = 'Confirmar',
  cancelarLabel = 'Cancelar',
  carregando = false,
  tom = 'default',
  onConfirmar,
  onCancelar,
  children,
}: Props) {
  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open && !carregando) onCancelar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        {children}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={carregando}
          >
            {cancelarLabel}
          </Button>
          <Button
            type="button"
            variant={tom === 'destructive' ? 'destructive' : 'default'}
            onClick={() => void onConfirmar()}
            disabled={carregando}
          >
            {carregando ? 'Aguarde...' : confirmarLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
