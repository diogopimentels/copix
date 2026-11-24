'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  authServico,
  cobrancasServico,
  conciliacoesServico,
  lancamentosServico,
  limparToken,
  lerToken,
  organizacoesServico,
  pagamentosServico,
  simuladorServico,
} from '@/lib/api';
import {
  formatarData,
  formatarMoeda,
  parsearValorBRL,
} from '@/lib/utils/formatadores';
import type {
  Cobranca,
  Conciliacao,
  Organizacao,
  Pagamento,
  PainelConciliacao,
  ResumoLancamentos,
  Usuario,
} from '@/types/dominio';

export default function PaginaPainel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [organizacaoId, setOrganizacaoId] = useState('');
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [conciliacoes, setConciliacoes] = useState<Conciliacao[]>([]);
  const [painel, setPainel] = useState<PainelConciliacao | null>(null);
  const [resumo, setResumo] = useState<ResumoLancamentos | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [novaOrgNome, setNovaOrgNome] = useState('');
  const [novaOrgDoc, setNovaOrgDoc] = useState('');
  const [novaCobrancaDesc, setNovaCobrancaDesc] = useState('');
  const [novaCobrancaValor, setNovaCobrancaValor] = useState('29,90');

  const carregarDados = useCallback(async (id: string) => {
    const [listaCobrancas, listaPagamentos, listaConciliacoes, painelAtual, resumoAtual] =
      await Promise.all([
        cobrancasServico.listar(id),
        pagamentosServico.listar(id),
        conciliacoesServico.listar(id),
        conciliacoesServico.painel(id),
        lancamentosServico.resumo(id),
      ]);

    setCobrancas(listaCobrancas);
    setPagamentos(listaPagamentos);
    setConciliacoes(listaConciliacoes);
    setPainel(painelAtual);
    setResumo(resumoAtual);
  }, []);

  useEffect(() => {
    if (!lerToken()) {
      router.replace('/');
      return;
    }

    async function iniciar() {
      try {
        const perfil = await authServico.eu();
        setUsuario(perfil);

        const lista = await organizacoesServico.listar();
        setOrganizacoes(lista);

        const primeira = lista[0];
        if (primeira) {
          setOrganizacaoId(primeira.id);
          await carregarDados(primeira.id);
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar painel');
        limparToken();
        router.replace('/');
      } finally {
        setCarregando(false);
      }
    }

    void iniciar();
  }, [router, carregarDados]);

  async function trocarOrganizacao(id: string) {
    setOrganizacaoId(id);
    setErro('');
    try {
      await carregarDados(id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar dados');
    }
  }

  async function criarOrganizacao(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    try {
      const org = await organizacoesServico.criar({
        nome: novaOrgNome,
        documento: novaOrgDoc.replace(/\D/g, ''),
      });
      setNovaOrgNome('');
      setNovaOrgDoc('');
      toast.success('Organização criada');
      const lista = await organizacoesServico.listar();
      setOrganizacoes(lista);
      await trocarOrganizacao(org.id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar organização');
    }
  }

  async function criarCobranca(evento: FormEvent) {
    evento.preventDefault();
    if (!organizacaoId) return;
    setErro('');

    try {
      const valorCentavos = parsearValorBRL(novaCobrancaValor);
      await cobrancasServico.criar(organizacaoId, {
        descricao: novaCobrancaDesc,
        valorCentavos,
      });
      setNovaCobrancaDesc('');
      toast.success('Cobrança criada');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar cobrança');
    }
  }

  async function simularPagamento(cobrancaId: string) {
    if (!organizacaoId) return;
    setErro('');
    try {
      await simuladorServico.pagar(organizacaoId, { cobrancaId });
      toast.success('Pagamento simulado e conciliado');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao simular pagamento');
    }
  }

  async function executarConciliacao() {
    if (!organizacaoId) return;
    try {
      await conciliacoesServico.executar(organizacaoId);
      toast.success('Varredura de conciliação concluída');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro na varredura');
    }
  }

  function sair() {
    limparToken();
    router.replace('/');
  }

  if (carregando) {
    return (
      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight">
            Copix
          </p>
          <p className="text-sm text-muted-foreground">Olá, {usuario?.nome}</p>
        </div>
        <Button type="button" variant="outline" onClick={sair}>
          Sair
        </Button>
      </header>

      {erro ? (
        <p className="text-sm text-destructive" role="alert">
          {erro}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={organizacaoId}
              onChange={(e) => void trocarOrganizacao(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {organizacoes.length === 0 ? (
                <option value="">Nenhuma ainda</option>
              ) : null}
              {organizacoes.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nome}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova organização</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarOrganizacao} className="grid gap-3">
              <Input
                placeholder="Nome"
                value={novaOrgNome}
                onChange={(e) => setNovaOrgNome(e.target.value)}
                required
              />
              <Input
                placeholder="CNPJ (só números)"
                value={novaOrgDoc}
                onChange={(e) => setNovaOrgDoc(e.target.value)}
                required
              />
              <Button type="submit">Criar</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {organizacaoId ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <p className="text-sm text-muted-foreground">Saldo no razão</p>
                <CardTitle className="text-2xl">
                  {formatarMoeda(resumo?.saldoCentavos ?? 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-muted-foreground">Conciliadas</p>
                <CardTitle className="text-2xl">
                  {painel?.conciliadas ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-muted-foreground">Divergentes</p>
                <CardTitle className="text-2xl">
                  {painel?.divergentes ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </section>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle>Cobranças</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void executarConciliacao()}
              >
                Rodar conciliação
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form
                onSubmit={criarCobranca}
                className="grid gap-3 md:grid-cols-[1fr_160px_auto]"
              >
                <Input
                  placeholder="Descrição"
                  value={novaCobrancaDesc}
                  onChange={(e) => setNovaCobrancaDesc(e.target.value)}
                  required
                />
                <Input
                  placeholder="Valor (ex: 29,90)"
                  value={novaCobrancaValor}
                  onChange={(e) => setNovaCobrancaValor(e.target.value)}
                  required
                />
                <Button type="submit">Criar</Button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 font-medium">Descrição</th>
                      <th className="py-2 font-medium">Valor</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="py-2 font-medium">Txid</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {cobrancas.map((cobranca) => (
                      <tr key={cobranca.id} className="border-b border-border/70">
                        <td className="py-3">{cobranca.descricao}</td>
                        <td className="py-3">
                          {formatarMoeda(cobranca.valorCentavos)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              cobranca.status === 'PAGA'
                                ? 'sucesso'
                                : cobranca.status === 'PENDENTE'
                                  ? 'alerta'
                                  : 'erro'
                            }
                          >
                            {cobranca.status}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-xs">{cobranca.txid}</td>
                        <td className="py-3 text-right">
                          {cobranca.status === 'PENDENTE' ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void simularPagamento(cobranca.id)}
                            >
                              Simular Pix
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamentos recebidos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 font-medium">End-to-end</th>
                    <th className="py-2 font-medium">Valor</th>
                    <th className="py-2 font-medium">Recebido em</th>
                    <th className="py-2 font-medium">Provedor</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((pagamento) => (
                    <tr key={pagamento.id} className="border-b border-border/70">
                      <td className="py-3 font-mono text-xs">
                        {pagamento.endToEndId}
                      </td>
                      <td className="py-3">
                        {formatarMoeda(pagamento.valorCentavos)}
                      </td>
                      <td className="py-3">{formatarData(pagamento.recebidoEm)}</td>
                      <td className="py-3">{pagamento.provedor?.nome ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conciliações</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Cobrança</th>
                    <th className="py-2 font-medium">Pagamento</th>
                    <th className="py-2 font-medium">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {conciliacoes.map((item) => (
                    <tr key={item.id} className="border-b border-border/70">
                      <td className="py-3">
                        <Badge
                          variant={
                            item.status === 'CONCILIADO'
                              ? 'sucesso'
                              : item.status === 'DIVERGENTE'
                                ? 'erro'
                                : 'alerta'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3">{item.cobranca?.descricao ?? '-'}</td>
                      <td className="py-3 font-mono text-xs">
                        {item.pagamento?.endToEndId ?? '-'}
                      </td>
                      <td className="py-3">{item.motivoDivergencia ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}
