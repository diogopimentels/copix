'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chamarApi, lerToken, salvarToken } from '@/lib/api';
import type { Usuario } from '@/lib/tipos';

type RespostaAuth = {
  usuario: Usuario;
  acesso: { token: string };
};

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
      const caminho = modo === 'entrar' ? '/auth/entrar' : '/auth/registrar';
      const corpo =
        modo === 'entrar'
          ? { email, senha }
          : { nome, email, senha };

      const resposta = await chamarApi<RespostaAuth>(caminho, {
        method: 'POST',
        body: JSON.stringify(corpo),
      });

      salvarToken(resposta.acesso.token);
      router.push('/painel');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível autenticar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container" style={{ padding: '4rem 0' }}>
      <section
        className="painel"
        style={{
          maxWidth: 460,
          margin: '0 auto',
          display: 'grid',
          gap: '1.25rem',
        }}
      >
        <div>
          <p className="marca" style={{ fontSize: '2rem', margin: 0 }}>
            Copix
          </p>
          <p style={{ color: 'var(--texto-suave)', margin: '0.4rem 0 0' }}>
            Conciliação Pix sem planilha improvisada.
          </p>
        </div>

        <form onSubmit={enviar} style={{ display: 'grid', gap: '0.9rem' }}>
          {modo === 'registrar' && (
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {erro && <p className="erro-texto">{erro}</p>}

          <button className="botao" type="submit" disabled={carregando}>
            {carregando
              ? 'Aguarde...'
              : modo === 'entrar'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className="botao secundario"
          onClick={() =>
            setModo((atual) => (atual === 'entrar' ? 'registrar' : 'entrar'))
          }
        >
          {modo === 'entrar'
            ? 'Não tem conta? Registrar'
            : 'Já tem conta? Entrar'}
        </button>
      </section>
    </main>
  );
}
