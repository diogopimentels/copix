import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  tamanho?: 'sm' | 'md';
  comSubtitulo?: boolean;
};

export function MarcaCopix({
  className,
  tamanho = 'md',
  comSubtitulo = false,
}: Props) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground',
          tamanho === 'sm' && 'size-7 text-xs',
          tamanho === 'md' && 'size-8 text-sm',
        )}
        aria-hidden
      >
        C
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            'font-semibold tracking-tight text-foreground',
            tamanho === 'sm' && 'text-sm',
            tamanho === 'md' && 'text-base',
          )}
        >
          Copix
        </p>
        {comSubtitulo ? (
          <p className="text-[11px] text-muted-foreground">Conciliação Pix</p>
        ) : null}
      </div>
    </div>
  );
}
