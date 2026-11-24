import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormularioRegistro } from '@/features/auth/formulario-registro';

export const metadata: Metadata = {
  title: 'Registro',
};

export default function PaginaRegistro() {
  return (
    <Card className="w-full">
      <CardHeader>
        <p className="font-display text-3xl font-semibold tracking-tight">Copix</p>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece com uma organização e um provedor simulador prontos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormularioRegistro />
      </CardContent>
    </Card>
  );
}
