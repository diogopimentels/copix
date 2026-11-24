'use client';

import { Suspense, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Paginacao } from '@/components/shared/paginacao';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { ToolbarFiltros } from '@/components/shared/toolbar-filtros';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListaPaginada } from '@/hooks/use-lista-paginada';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { usePagamentos } from '@/hooks/use-pagamentos';
import { useParametroBusca } from '@/hooks/use-parametro-busca';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

const POR_PAGINA = 10;

function ConteudoPagamentos() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = usePagamentos(organizacaoId);
  const [busca, setBusca] = useParametroBusca('q');

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return (data ?? []).filter(
      (item) =>
        item.endToEndId.toLowerCase().includes(termo) ||
        (item.txid ?? '').toLowerCase().includes(termo) ||
        (item.provedor?.nome ?? '').toLowerCase().includes(termo),
    );
  }, [data, busca]);

  const { fatia, pagina, totalPaginas, totalItens, setPagina, reiniciarPagina } =
    useListaPaginada(filtrados, POR_PAGINA);

  if (!organizacaoId) {
    return (
      <EstadoVazio
        titulo="Selecione uma organização"
        descricao="Os pagamentos dependem da organização ativa."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Pagamentos"
        descricao="Histórico de Pix recebidos via webhook ou simulador."
      />

      <Card>
        <CardHeader className="gap-3 space-y-0">
          <CardTitle>Recebidos</CardTitle>
          <ToolbarFiltros>
            <Input
              placeholder="Buscar por end-to-end, txid ou provedor"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                reiniciarPagina();
              }}
              className="sm:max-w-md"
            />
          </ToolbarFiltros>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : null}
          {isError ? (
            <EstadoErro
              mensagem={
                error instanceof Error ? error.message : 'Erro ao listar pagamentos'
              }
              onTentarNovamente={() => void refetch()}
            />
          ) : null}
          {!isLoading && !isError && fatia.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum pagamento"
              descricao="Simule um Pix a partir de uma cobrança pendente."
            />
          ) : null}
          {!isLoading && !isError && fatia.length > 0 ? (
            <>
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>End-to-end</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Txid</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Recebido em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fatia.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell className="font-mono text-xs">
                          {pagamento.endToEndId}
                        </TableCell>
                        <TableCell>{formatarMoeda(pagamento.valorCentavos)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pagamento.status === 'ESTORNADO' ? 'erro' : 'sucesso'
                            }
                          >
                            {pagamento.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {pagamento.txid ?? '-'}
                        </TableCell>
                        <TableCell>{pagamento.provedor?.nome ?? '-'}</TableCell>
                        <TableCell>{formatarData(pagamento.recebidoEm)}</TableCell>
                      </TableRow>
                    ))}
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
    </div>
  );
}

export default function PaginaPagamentos() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ConteudoPagamentos />
    </Suspense>
  );
}
