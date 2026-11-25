import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  rotulo: string;
  valor: ReactNode;
  detalhe?: string;
  destaque?: boolean;
  tom?: 'padrao' | 'alerta' | 'sucesso';
  className?: string;
};

export function Kpi({
  rotulo,
  valor,
  detalhe,
  destaque = false,
  tom = 'padrao',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'min-w-0 px-4 py-3',
        destaque && 'bg-primary/[0.03]',
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{rotulo}</p>
      <p
        className={cn(
          'mt-1 texto-financeiro text-[28px] font-semibold leading-tight',
          tom === 'alerta' && 'text-destructive',
          tom === 'sucesso' && 'text-sucesso',
          tom === 'padrao' && 'text-foreground',
        )}
      >
        {valor}
      </p>
      {detalhe ? (
        <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>
      ) : null}
    </div>
  );
}
