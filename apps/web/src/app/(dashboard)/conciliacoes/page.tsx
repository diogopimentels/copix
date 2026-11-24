'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { BadgeStatusConciliacao } from '@/components/shared/status-badge';
import { Paginacao } from '@/components/shared/paginacao';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { ToolbarFiltros } from '@/components/shared/toolbar-filtros';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DrawerDetalheConciliacao } from '@/features/conciliacoes/drawer-detalhe-conciliacao';
import {
  useConciliacoes,
  useExecutarConciliacao,
  usePainelConciliacao,
} from '@/hooks/use-conciliacoes';
import { useListaPaginada } from '@/hooks/use-lista-paginada';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { useParametroBusca } from '@/hooks/use-parametro-busca';
import { cn } from '@/lib/utils';
import { formatarMoeda } from '@/lib/utils/formatadores';
import type { Conciliacao, StatusConciliacao } from '@/types/dominio';

const POR_PAGINA = 10;

function deltaCentavos(item: Conciliacao) {
  if (!item.cobranca || !item.pagamento) return null;
  return item.pagamento.valorCentavos - item.cobranca.valorCentavos;
}

function ConteudoConciliacoes() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const lista = useConciliacoes(organizacaoId);
  const painel = usePainelConciliacao(organizacaoId);
  const executar = useExecutarConciliacao(organizacaoId);
  const [status, setStatus] = useParametroBusca('status', 'TODOS');
  const [detalhe, setDetalhe] = useState<Conciliacao | null>(null);

  const filtradas = useMemo(() => {
    return (lista.data ?? []).filter(
      (item) => status === 'TODOS' || item.status === (status as StatusConciliacao),
    );
  }, [lista.data, status]);

  const { fatia, pagina, totalPaginas, totalItens, setPagina, reiniciarPagina } =
    useListaPaginada(filtradas, POR_PAGINA);

  async function rodar() {
    try {
      const resultado = await executar.mutateAsync();
      toast.success(`Varredura ok · ${resultado.paresCriados} par(es) criado(s)`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha na varredura');
    }
  }

  if (!organizacaoId) {
    return (
      <EstadoVazio
        titulo="Selecione uma organização"
        descricao="A conciliação opera por organização."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Conciliações"
        descricao="Compare cobrança e pagamento. Divergência de valor fica explícita."
        acoes={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/cobrancas">Ir para cobranças</Link>
            </Button>
            <Button
              type="button"
              onClick={() => void rodar()}
              disabled={executar.isPending}
            >
              {executar.isPending ? 'Executando...' : 'Executar conciliação'}
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Conciliadas</p>
            <CardTitle>{painel.data?.conciliadas ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <CardTitle>{painel.data?.pendentes ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Divergentes</p>
            <CardTitle className="text-destructive">
              {painel.data?.divergentes ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Histórico</CardTitle>
          <ToolbarFiltros>
            <NativeSelect
              className="sm:w-48"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                reiniciarPagina();
              }}
              aria-label="Filtrar conciliações"
            >
              <option value="TODOS">Todos</option>
              <option value="CONCILIADO">CONCILIADO</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="DIVERGENTE">DIVERGENTE</option>
            </NativeSelect>
          </ToolbarFiltros>
        </CardHeader>
        <CardContent>
          {lista.isLoading ? <Skeleton className="h-40 w-full" /> : null}
          {lista.isError ? (
            <EstadoErro
              mensagem={
                lista.error instanceof Error
                  ? lista.error.message
                  : 'Erro ao listar conciliações'
              }
              onTentarNovamente={() => void lista.refetch()}
            />
          ) : null}
          {!lista.isLoading && !lista.isError && filtradas.length === 0 ? (
            <EstadoVazio
              titulo={
                status === 'DIVERGENTE'
                  ? 'Nenhuma divergência'
                  : 'Nenhuma conciliação'
              }
              descricao={
                status === 'DIVERGENTE'
                  ? 'Bom sinal — não há pares com valor diferente.'
                  : 'Crie uma cobrança e simule o Pix para gerar o primeiro pareamento.'
              }
            />
          ) : null}
          {!lista.isLoading && !lista.isError && fatia.length > 0 ? (
            <>
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Cobrança</TableHead>
                      <TableHead>Cobrado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Delta</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fatia.map((item) => {
                      const delta = deltaCentavos(item);
                      const divergente = item.status === 'DIVERGENTE';
                      return (
                        <TableRow
                          key={item.id}
                          className={cn(divergente && 'bg-destructive/5')}
                        >
                          <TableCell>
                            <BadgeStatusConciliacao status={item.status} />
                          </TableCell>
                          <TableCell>{item.cobranca?.descricao ?? '-'}</TableCell>
                          <TableCell>
                            {item.cobranca
                              ? formatarMoeda(item.cobranca.valorCentavos)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {item.pagamento
                              ? formatarMoeda(item.pagamento.valorCentavos)
                              : '-'}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'font-mono text-xs',
                              divergente && 'font-semibold text-destructive',
                            )}
                          >
                            {delta === null
                              ? '-'
                              : `${delta >= 0 ? '+' : ''}${formatarMoeda(delta)}`}
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            {divergente ? (
                              <span className="text-sm text-destructive">
                                {item.motivoDivergencia ?? 'Divergência de valor'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setDetalhe(item)}
                            >
                              Detalhe
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabelaResponsiva>
              <Paginacao
                pagina={pagina}
                totalPaginas={totalPaginas}
                totalItens={totalItens}
                onMudar={setPagina}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <DrawerDetalheConciliacao
        item={detalhe}
        aberto={Boolean(detalhe)}
        onFechar={() => setDetalhe(null)}
      />
    </div>
  );
}

export default function PaginaConciliacoes() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ConteudoConciliacoes />
    </Suspense>
  );
}
