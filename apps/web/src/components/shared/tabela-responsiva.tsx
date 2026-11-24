'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/** Evita quebrar o layout em mobile; tabelas rolam no eixo X. */
export function TabelaResponsiva({ children, className }: Props) {
  return (
    <div className={cn('-mx-1 overflow-x-auto', className)}>
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}
