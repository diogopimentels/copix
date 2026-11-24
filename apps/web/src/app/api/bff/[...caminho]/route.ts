import { NextResponse } from 'next/server';
import {
  anexarLimpezaNaResposta,
  lerTokenDoCookie,
  urlApiInterna,
} from '@/lib/api/cookie-sessao';

type Contexto = { params: Promise<{ caminho: string[] }> };

async function proxyar(request: Request, contexto: Contexto) {
  const { caminho } = await contexto.params;
  const destino = `${urlApiInterna()}/${caminho.join('/')}${new URL(request.url).search}`;
  const token = await lerTokenDoCookie();

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const metodo = request.method.toUpperCase();
  const temCorpo = metodo !== 'GET' && metodo !== 'HEAD';

  const resposta = await fetch(destino, {
    method: metodo,
    headers,
    body: temCorpo ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
  });

  const buffer = await resposta.arrayBuffer();
  let saida = new NextResponse(buffer, { status: resposta.status });
  const tipo = resposta.headers.get('content-type');
  if (tipo) saida.headers.set('Content-Type', tipo);

  if (resposta.status === 401 || resposta.status === 403) {
    saida = anexarLimpezaNaResposta(saida);
  }

  return saida;
}

export const GET = proxyar;
export const POST = proxyar;
export const PUT = proxyar;
export const PATCH = proxyar;
export const DELETE = proxyar;
