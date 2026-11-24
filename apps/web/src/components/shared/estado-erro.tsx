import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  titulo?: string;
  mensagem: string;
  onTentarNovamente?: () => void;
  className?: string;
};

export function EstadoErro({
  titulo = 'Não foi possível carregar',
  mensagem,
  onTentarNovamente,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5',
        className,
      )}
      role="alert"
    >
      <div>
        <p className="font-medium text-foreground">{titulo}</p>
        <p className="mt-1 text-sm text-muted-foreground">{mensagem}</p>
      </div>
      {onTentarNovamente ? (
        <Button type="button" variant="outline" size="sm" onClick={onTentarNovamente}>
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}
