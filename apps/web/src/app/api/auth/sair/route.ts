import { NextResponse } from 'next/server';
import { anexarLimpezaNaResposta } from '@/lib/api/cookie-sessao';

export async function POST() {
  return anexarLimpezaNaResposta(NextResponse.json({ ok: true }));
}
