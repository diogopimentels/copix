'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Kpi } from '@/components/shared/kpi';
import { BadgeStatusCobranca, BadgeStatusConciliacao } from '@/components/shared/status-badge';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

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
          titulo="Visão geral"
          descricao="Crie uma organização em Configurações para começar."
        />
        <EstadoVazio
          titulo="Nenhuma organização"
          descricao="Selecione ou crie uma organização para ver o painel."
          acao={
            <Button asChild>
              <Link href="/configuracoes">Abrir configurações</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EstadoErro
        mensagem={
          error instanceof Error ? error.message : 'Não foi possível carregar o painel'
        }
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
    <div className="grid gap-8">
      <PageHeader
        titulo="Visão geral"
        descricao={organizacao?.nome}
        acoes={
          <Button type="button" asChild>
            <Link href="/cobrancas">Nova cobrança</Link>
          </Button>
        }
      />

      {precisaAtencao ? (
        <section className="flex flex-wrap items-center gap-2 border-y border-border py-3 text-sm">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Atenção
          </span>
          {data.painel.divergentes > 0 ? (
            <Link
              href="/conciliacoes?status=DIVERGENTE"
              className="rounded-md bg-destructive/5 px-2.5 py-1 text-destructive hover:bg-destructive/10"
            >
              {data.painel.divergentes} divergência
              {data.painel.divergentes === 1 ? '' : 's'}
            </Link>
          ) : null}
          {data.painel.cobrancasPendentes > 0 ? (
            <Link
              href="/cobrancas?status=PENDENTE"
              className="rounded-md bg-muted px-2.5 py-1 hover:bg-muted/80"
            >
              {data.painel.cobrancasPendentes} cobrança
              {data.painel.cobrancasPendentes === 1 ? '' : 's'} em aberto
            </Link>
          ) : null}
          {data.painel.pagamentosSemPar > 0 ? (
            <Link
              href="/conciliacoes?status=PENDENTE"
              className="rounded-md bg-muted px-2.5 py-1 hover:bg-muted/80"
            >
              {data.painel.pagamentosSemPar} pagamento
              {data.painel.pagamentosSemPar === 1 ? '' : 's'} sem correspondência
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            className="border-b border-border sm:border-r lg:border-b-0"
            destaque
            rotulo="Saldo"
            valor={formatarMoeda(data.resumo.saldoCentavos)}
          />
          <Kpi
            className="border-b border-border sm:border-b-0 lg:border-r"
            rotulo="Divergências"
            valor={data.painel.divergentes}
            tom={data.painel.divergentes > 0 ? 'alerta' : 'padrao'}
          />
          <Kpi
            className="border-b border-border sm:border-r lg:border-b-0"
            rotulo="Cobranças"
            valor={data.totais.cobrancas}
            detalhe={`${data.totais.cobrancasPagas} pagas`}
          />
          <Kpi
            rotulo="Conciliadas"
            valor={taxa === null ? '—' : `${taxa}%`}
            detalhe={`${data.painel.conciliadas} pares`}
            tom={taxa !== null && taxa >= 80 ? 'sucesso' : 'padrao'}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight">Conciliação</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/conciliacoes">Ver detalhes</Link>
          </Button>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { rotulo: 'Conciliadas', valor: data.painel.conciliadas },
            { rotulo: 'Pendentes', valor: data.painel.pendentes },
            { rotulo: 'Em aberto', valor: data.painel.cobrancasPendentes },
            { rotulo: 'Sem correspondência', valor: data.painel.pagamentosSemPar },
          ].map((item) => (
            <div key={item.rotulo} className="bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{item.rotulo}</p>
              <p className="mt-1 texto-financeiro text-lg font-semibold">
                {item.valor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight">Atividade recente</h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Cobranças</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cobrancas">Ver todas</Link>
              </Button>
            </div>
          </div>
          {data.recentes.cobrancas.length === 0 ? (
            <div className="p-4">
              <EstadoVazio titulo="Nenhuma cobrança" />
            </div>
          ) : (
            <TabelaResponsiva>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentes.cobrancas.map((cobranca) => (
                    <TableRow key={cobranca.id}>
                      <TableCell className="font-medium">{cobranca.descricao}</TableCell>
                      <TableCell className="texto-financeiro text-right">
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
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Conciliações</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/conciliacoes">Ver todas</Link>
              </Button>
            </div>
          </div>
          {data.recentes.conciliacoes.length === 0 ? (
            <div className="p-4">
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
                    <TableRow
                      key={item.id}
                      className={cn(item.status === 'DIVERGENTE' && 'bg-destructive/[0.03]')}
                    >
                      <TableCell>
                        <BadgeStatusConciliacao status={item.status} />
                      </TableCell>
                      <TableCell>{item.cobranca?.descricao ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatarData(item.criadoEm)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabelaResponsiva>
          )}
        </div>
      </section>
    </div>
  );
}
