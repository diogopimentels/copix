'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authServico, lerToken, salvarToken } from '@/lib/api';

export default function PaginaLogin() {
  const router = useRouter();
  const [modo, setModo] = useState<'entrar' | 'registrar'>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('demo@copix.local');
  const [senha, setSenha] = useState('senha123');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (lerToken()) {
      router.replace('/painel');
    }
  }, [router]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta =
        modo === 'entrar'
          ? await authServico.entrar({ email, senha })
          : await authServico.registrar({ nome, email, senha });

      salvarToken(resposta.acesso.token);
      toast.success(modo === 'entrar' ? 'Login feito' : 'Conta criada');
      router.push('/painel');
    } catch (e) {
      const mensagem =
        e instanceof Error ? e.message : 'Não foi possível autenticar';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Copix
          </p>
          <CardTitle className="sr-only">
            {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </CardTitle>
          <CardDescription>
            Conciliação Pix com trilha clara de cobrança, pagamento e razão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="grid gap-4">
            {modo === 'registrar' ? (
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                autoComplete={
                  modo === 'entrar' ? 'current-password' : 'new-password'
                }
              />
            </div>

            {erro ? (
              <p className="text-sm text-destructive" role="alert">
                {erro}
              </p>
            ) : null}

            <Button type="submit" disabled={carregando} className="w-full">
              {carregando
                ? 'Aguarde...'
                : modo === 'entrar'
                  ? 'Entrar'
                  : 'Criar conta'}
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() =>
              setModo((atual) => (atual === 'entrar' ? 'registrar' : 'entrar'))
            }
          >
            {modo === 'entrar'
              ? 'Não tem conta? Registrar'
              : 'Já tem conta? Entrar'}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo: demo@copix.local / senha123 ·{' '}
            <Link href="/painel" className="underline-offset-2 hover:underline">
              painel
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
