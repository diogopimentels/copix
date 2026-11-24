import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormularioEntrar } from '@/features/auth/formulario-entrar';
import { RedirectSeAutenticado } from '@/features/auth/redirect-se-autenticado';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default function PaginaLogin() {
  return (
    <Card className="w-full">
      <RedirectSeAutenticado />
      <CardHeader>
        <p className="font-display text-3xl font-semibold tracking-tight">Copix</p>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acompanhe cobranças, pagamentos e conciliação Pix num só lugar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormularioEntrar />
      </CardContent>
    </Card>
  );
}
