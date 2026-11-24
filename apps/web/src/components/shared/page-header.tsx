import type { ReactNode } from 'react';

type Props = {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
};

export function PageHeader({ titulo, descricao, acoes }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {titulo}
        </h1>
        {descricao ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{descricao}</p>
        ) : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}
