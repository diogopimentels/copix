'use client';

import { Button } from '@/components/ui/button';

type Props = {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  onMudar: (pagina: number) => void;
};

export function Paginacao({ pagina, totalPaginas, totalItens, onMudar }: Props) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{totalItens} resultado(s)</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => onMudar(pagina - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          {pagina}/{totalPaginas}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => onMudar(pagina + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
