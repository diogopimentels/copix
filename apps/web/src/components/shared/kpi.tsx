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

/** Indicador financeiro sem “card idêntico” obrigatório — hierarquia via destaque. */
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
        'rounded-lg border border-border bg-card px-4 py-3.5',
        destaque && 'border-primary/25 bg-primary/[0.03]',
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{rotulo}</p>
      <p
        className={cn(
          'mt-1.5 texto-financeiro text-2xl font-semibold tracking-tight',
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
