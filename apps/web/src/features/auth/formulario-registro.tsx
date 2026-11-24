'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegistrar } from '@/hooks/use-auth';
import { schemaRegistrar, type DadosRegistrar } from '@/lib/validations/auth';

export function FormularioRegistro() {
  const registrar = useRegistrar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosRegistrar>({
    resolver: zodResolver(schemaRegistrar),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
    },
  });

  async function onSubmit(dados: DadosRegistrar) {
    try {
      await registrar.mutateAsync(dados);
      toast.success('Conta criada');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha no registro');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" autoComplete="name" {...register('nome')} />
        {errors.nome ? (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
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
          autoComplete="new-password"
          {...register('senha')}
        />
        {errors.senha ? (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={registrar.isPending}>
        {registrar.isPending ? 'Criando...' : 'Criar conta'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
