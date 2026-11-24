import type { ReactNode } from 'react';
import { MarcaCopix } from '@/components/shared/marca-copix';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, hsl(175 84% 26% / 0.35), transparent 45%), radial-gradient(circle at 80% 80%, hsl(215 40% 40% / 0.25), transparent 40%)',
          }}
          aria-hidden
        />
        <MarcaCopix tom="escuro" tamanho="lg" className="relative" />
        <div className="relative max-w-md space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance xl:text-4xl">
            Conciliação Pix com precisão de razão.
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-muted">
            Acompanhe cobranças, pagamentos e divergências em um fluxo único —
            feito para operação financeira B2B, não para demos genéricas.
          </p>
          <dl className="grid gap-3 border-t border-sidebar-border pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-sidebar-muted">Pareamento</dt>
              <dd className="font-medium">Cobrança × pagamento</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sidebar-muted">Razão</dt>
              <dd className="font-medium">Centavos e auditoria</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sidebar-muted">Provedor</dt>
              <dd className="font-medium">Simulador HMAC</dd>
            </div>
          </dl>
        </div>
        <p className="relative text-xs text-sidebar-muted">
          Copix · multi-tenant · JWT via cookie HttpOnly
        </p>
      </aside>

      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center border-b border-border px-5 py-4 lg:hidden">
          <MarcaCopix tom="claro" tamanho="sm" />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
