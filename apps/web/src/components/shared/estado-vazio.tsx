import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
};

export function EstadoVazio({ titulo, descricao, acao, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <p className="font-medium text-foreground">{titulo}</p>
      {descricao ? (
        <p className="max-w-sm text-sm text-muted-foreground">{descricao}</p>
      ) : null}
      {acao ? <div className="mt-3">{acao}</div> : null}
    </div>
  );
}
