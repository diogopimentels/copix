import type { Metadata } from 'next';
import { FormularioRegistro } from '@/features/auth/formulario-registro';

export const metadata: Metadata = {
  title: 'Criar conta',
};

export default function PaginaRegistro() {
  return (
    <div className="grid gap-8">
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-semibold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre-se para começar a usar o Copix.
        </p>
      </div>
      <FormularioRegistro />
    </div>
  );
}
