import type { Metadata } from 'next';
import { FormularioRegistro } from '@/features/auth/formulario-registro';

export const metadata: Metadata = {
  title: 'Registro',
};

export default function PaginaRegistro() {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro individual. Depois você cria ou seleciona a organização no
          painel.
        </p>
      </div>
      <FormularioRegistro />
    </div>
  );
}
