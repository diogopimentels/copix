'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEntrar } from '@/hooks/use-auth';
import { schemaEntrar, type DadosEntrar } from '@/lib/validations/auth';

export function FormularioEntrar() {
  const entrar = useEntrar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosEntrar>({
    resolver: zodResolver(schemaEntrar),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  async function onSubmit(dados: DadosEntrar) {
    try {
      await entrar.mutateAsync(dados);
      toast.success('Login feito');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha no login');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          autoComplete="current-password"
          {...register('senha')}
        />
        {errors.senha ? (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={entrar.isPending}>
        {entrar.isPending ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/registro" className="font-medium text-foreground underline-offset-4 hover:underline">
          Registrar
        </Link>
      </p>

      <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        Ambiente demo:{' '}
        <span className="font-mono text-foreground">demo@copix.local</span> /{' '}
        <span className="font-mono text-foreground">senha123</span>
      </div>
    </form>
  );
}
