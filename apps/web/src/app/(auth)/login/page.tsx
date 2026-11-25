import type { Metadata } from 'next';
import { FormularioEntrar } from '@/features/auth/formulario-entrar';
import { RedirectSeAutenticado } from '@/features/auth/redirect-se-autenticado';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default function PaginaLogin() {
  return (
    <div className="grid gap-8">
      <RedirectSeAutenticado />
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">Acesse sua conta Copix.</p>
      </div>
      <FormularioEntrar />
    </div>
  );
}
