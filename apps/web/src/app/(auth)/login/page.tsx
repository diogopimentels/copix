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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse o painel da sua organização para operar cobranças e conciliação.
        </p>
      </div>
      <FormularioEntrar />
    </div>
  );
}
