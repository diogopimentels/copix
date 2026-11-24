'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ITENS_NAVEGACAO } from '@/lib/navegacao';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

export function Sidebar() {
  const pathname = usePathname();
  const menuAberto = useUiStore((s) => s.menuAberto);
  const fecharMenu = useUiStore((s) => s.fecharMenu);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/30 transition-opacity md:hidden',
          menuAberto ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={fecharMenu}
        aria-hidden={!menuAberto}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform md:static md:translate-x-0',
          menuAberto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-sidebar-border px-5 py-5">
          <Link
            href="/dashboard"
            className="font-display text-2xl font-semibold tracking-tight text-sidebar-foreground"
            onClick={fecharMenu}
          >
            Copix
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Conciliação Pix</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Principal">
          {ITENS_NAVEGACAO.map((item) => {
            const ativo =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icone = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={fecharMenu}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  ativo
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                )}
                aria-current={ativo ? 'page' : undefined}
              >
                <Icone className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
