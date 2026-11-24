import { NextResponse } from 'next/server';
import {
  anexarSessaoNaResposta,
  urlApiInterna,
} from '@/lib/api/cookie-sessao';

export async function POST(request: Request) {
  const corpo = await request.text();
  const resposta = await fetch(`${urlApiInterna()}/auth/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corpo,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    return NextResponse.json(dados, { status: resposta.status });
  }

  const token = (dados as { acesso?: { token?: string } })?.acesso?.token;
  if (!token) {
    return NextResponse.json(
      { message: 'Resposta de auth sem token' },
      { status: 502 },
    );
  }

  const resto = { ...(dados as Record<string, unknown>) };
  delete resto.acesso;

  return anexarSessaoNaResposta(
    NextResponse.json({
      ...resto,
      acesso: { tipo: 'Cookie', expiraEm: '1d' },
    }),
    token,
  );
}
