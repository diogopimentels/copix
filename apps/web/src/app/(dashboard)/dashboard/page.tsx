'use client';

import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { BadgeStatusCobranca, BadgeStatusConciliacao } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
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

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Dashboard"
        descricao={`Visão financeira de ${organizacao?.nome ?? 'sua organização'}.`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Saldo no razão</p>
            <CardTitle className="text-2xl">
              {formatarMoeda(data.resumo.saldoCentavos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Cobranças</p>
            <CardTitle className="text-2xl">{data.totais.cobrancas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Pagamentos</p>
            <CardTitle className="text-2xl">{data.totais.pagamentos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Divergências</p>
            <CardTitle className="text-2xl">{data.painel.divergentes}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.seriePagamentos.length === 0 ? (
              <EstadoVazio
                titulo="Sem pagamentos ainda"
                descricao="Simule um Pix em Cobranças para ver a série."
              />
            ) : (
              <GraficoPagamentos dados={data.seriePagamentos} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conciliação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span>Conciliadas</span>
              <strong>{data.painel.conciliadas}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span>Pendentes</span>
              <strong>{data.painel.pendentes}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span>Cobranças em aberto</span>
              <strong>{data.painel.cobrancasPendentes}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span>Pagamentos sem par</span>
              <strong>{data.painel.pagamentosSemPar}</strong>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas cobranças</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{cobranca.descricao}</TableCell>
                    <TableCell>{formatarMoeda(cobranca.valorCentavos)}</TableCell>
                    <TableCell>
                      <BadgeStatusCobranca status={cobranca.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas conciliações</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{formatarData(item.criadoEm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
