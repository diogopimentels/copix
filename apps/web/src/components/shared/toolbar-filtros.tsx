'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/** Barra padrão de busca + filtros das listagens. */
export function ToolbarFiltros({ children, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
}
