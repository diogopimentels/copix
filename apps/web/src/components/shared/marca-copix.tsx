import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  tom?: 'claro' | 'escuro';
  tamanho?: 'sm' | 'md' | 'lg';
};

export function MarcaCopix({
  className,
  tom = 'escuro',
  tamanho = 'md',
}: Props) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground',
          tamanho === 'sm' && 'size-7 text-xs',
          tamanho === 'md' && 'size-8 text-sm',
          tamanho === 'lg' && 'size-10 text-base',
        )}
        aria-hidden
      >
        C
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            'font-semibold tracking-tight',
            tamanho === 'sm' && 'text-sm',
            tamanho === 'md' && 'text-base',
            tamanho === 'lg' && 'text-xl',
            tom === 'escuro' ? 'text-sidebar-foreground' : 'text-foreground',
          )}
        >
          Copix
        </p>
        {tamanho !== 'sm' ? (
          <p
            className={cn(
              'text-[11px]',
              tom === 'escuro' ? 'text-sidebar-muted' : 'text-muted-foreground',
            )}
          >
            Conciliação Pix
          </p>
        ) : null}
      </div>
    </div>
  );
}
