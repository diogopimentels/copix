'use client';

import { useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Props = {
  valor: string;
  rotulo?: string;
};

function mascarar(valor: string) {
  if (valor.length <= 8) return '••••••••';
  return `${valor.slice(0, 4)}••••••••${valor.slice(-4)}`;
}

export function SegredoMascarado({ valor, rotulo = 'Segredo' }: Props) {
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      toast.success(`${rotulo} copiado`);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      toast.error('Não foi possível copiar');
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <code className="font-mono text-xs text-muted-foreground">
        {visivel ? valor : mascarar(valor)}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
      >
        {visivel ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => void copiar()}
        aria-label={`Copiar ${rotulo}`}
      >
        {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}
