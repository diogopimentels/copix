'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Kpi } from '@/components/shared/kpi';
import { BadgeStatusCobranca, BadgeStatusConciliacao } from '@/components/shared/status-badge';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/hooks/use-dashboard';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

const GraficoPagamentos = dynamic(
  () =>
    import('@/features/dashboard/grafico-pagamentos').then(
      (mod) => mod.GraficoPagamentos,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  },
);

function taxaConciliacao(painel: {
  conciliadas: number;
  divergentes: number;
  pendentes: number;
}) {
  const total = painel.conciliadas + painel.divergentes + painel.pendentes;
  if (total === 0) return null;
  return Math.round((painel.conciliadas / total) * 100);
}

export default function PaginaDashboard() {
  const { organizacaoId, organizacao } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = useDashboard(organizacaoId);

  if (!organizacaoId && !isLoading) {
    return (
      <div className="grid gap-6">
        <PageHeader
          titulo="Dashboard"
          descricao="Crie uma organização em Configurações para começar."
        />
        <EstadoVazio
          titulo="Nenhuma organização"
          descricao="Sem organização ativa não dá pra montar o painel financeiro."
          acao={
            <Button asChild>
              <Link href="/configuracoes">Ir para configurações</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 md:grid-cols-12">
          <Skeleton className="h-28 md:col-span-4" />
          <Skeleton className="h-28 md:col-span-2" />
          <Skeleton className="h-28 md:col-span-2" />
          <Skeleton className="h-28 md:col-span-2" />
          <Skeleton className="h-28 md:col-span-2" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EstadoErro
        mensagem={error instanceof Error ? error.message : 'Falha ao carregar dashboard'}
        onTentarNovamente={() => void refetch()}
      />
    );
  }

  const taxa = taxaConciliacao(data.painel);
  const precisaAtencao =
    data.painel.divergentes > 0 ||
    data.painel.cobrancasPendentes > 0 ||
    data.painel.pagamentosSemPar > 0;

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Dashboard"
        descricao={`Operação de ${organizacao?.nome ?? 'sua organização'}.`}
        acoes={
          <Button type="button" asChild>
            <Link href="/cobrancas">Nova cobrança</Link>
          </Button>
        }
      />

      {precisaAtencao ? (
        <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
          <p className="px-1 text-xs font-medium text-muted-foreground sm:mr-2">
            Atenção
          </p>
          {data.painel.divergentes > 0 ? (
            <Link
              href="/conciliacoes?status=DIVERGENTE"
              className="rounded-md bg-destructive/5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              {data.painel.divergentes} divergência(s)
            </Link>
          ) : null}
          {data.painel.cobrancasPendentes > 0 ? (
            <Link
              href="/cobrancas?status=PENDENTE"
              className="rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
            >
              {data.painel.cobrancasPendentes} cobrança(s) em aberto
            </Link>
          ) : null}
          {data.painel.pagamentosSemPar > 0 ? (
            <Link
              href="/conciliacoes?status=PENDENTE"
              className="rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
            >
              {data.painel.pagamentosSemPar} pagamento(s) sem par
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-12">
        <Kpi
          className="md:col-span-4"
          destaque
          rotulo="Saldo no razão"
          valor={formatarMoeda(data.resumo.saldoCentavos)}
          detalhe="Créditos − débitos (API)"
        />
        <Kpi
          className="md:col-span-2"
          rotulo="Cobranças"
          valor={data.totais.cobrancas}
          detalhe={`${data.totais.cobrancasPagas} pagas`}
        />
        <Kpi
          className="md:col-span-2"
          rotulo="Pagamentos"
          valor={data.totais.pagamentos}
        />
        <Kpi
          className="md:col-span-2"
          rotulo="Divergências"
          valor={data.painel.divergentes}
          tom={data.painel.divergentes > 0 ? 'alerta' : 'padrao'}
        />
        <Kpi
          className="md:col-span-2"
          rotulo="Taxa conciliada"
          valor={taxa === null ? '—' : `${taxa}%`}
          detalhe="pares da API"
          tom={taxa !== null && taxa >= 80 ? 'sucesso' : 'padrao'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Volume de pagamentos</CardTitle>
            <CardDescription>
              Soma diária a partir da lista atual de pagamentos (não é histórico
              agregado da API).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.seriePagamentos.length === 0 ? (
              <EstadoVazio
                titulo="Sem pagamentos ainda"
                descricao="Simule um Pix em Cobranças para ver o volume."
              />
            ) : (
              <GraficoPagamentos dados={data.seriePagamentos} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conciliação</CardTitle>
            <CardDescription>Painel da API — números confiáveis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { rotulo: 'Conciliadas', valor: data.painel.conciliadas },
              { rotulo: 'Pendentes', valor: data.painel.pendentes },
              { rotulo: 'Cobranças em aberto', valor: data.painel.cobrancasPendentes },
              { rotulo: 'Pagamentos sem par', valor: data.painel.pagamentosSemPar },
            ].map((item) => (
              <div
                key={item.rotulo}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{item.rotulo}</span>
                <span className="texto-financeiro font-semibold">{item.valor}</span>
              </div>
            ))}
            <Button type="button" variant="outline" className="mt-2" asChild>
              <Link href="/conciliacoes">Abrir conciliações</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Últimas cobranças</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cobrancas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {data.recentes.cobrancas.length === 0 ? (
              <div className="px-5 pb-5">
                <EstadoVazio titulo="Nenhuma cobrança" />
              </div>
            ) : (
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentes.cobrancas.map((cobranca) => (
                      <TableRow key={cobranca.id}>
                        <TableCell className="font-medium">{cobranca.descricao}</TableCell>
                        <TableCell className="texto-financeiro">
                          {formatarMoeda(cobranca.valorCentavos)}
                        </TableCell>
                        <TableCell>
                          <BadgeStatusCobranca status={cobranca.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabelaResponsiva>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Últimas conciliações</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/conciliacoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {data.recentes.conciliacoes.length === 0 ? (
              <div className="px-5 pb-5">
                <EstadoVazio titulo="Nenhuma conciliação" />
              </div>
            ) : (
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Cobrança</TableHead>
                      <TableHead>Quando</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentes.conciliacoes.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <BadgeStatusConciliacao status={item.status} />
                        </TableCell>
                        <TableCell>{item.cobranca?.descricao ?? '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatarData(item.criadoEm)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabelaResponsiva>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
