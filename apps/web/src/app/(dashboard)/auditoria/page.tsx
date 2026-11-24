'use client';

import { Suspense, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Paginacao } from '@/components/shared/paginacao';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { ToolbarFiltros } from '@/components/shared/toolbar-filtros';
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
import { useAuditoria } from '@/hooks/use-auditoria';
import { useListaPaginada } from '@/hooks/use-lista-paginada';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { useParametroBusca } from '@/hooks/use-parametro-busca';
import { formatarData } from '@/lib/utils/formatadores';

const POR_PAGINA = 10;

function ConteudoAuditoria() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = useAuditoria(organizacaoId);
  const [busca, setBusca] = useParametroBusca('q');

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return (data ?? []).filter(
      (item) =>
        item.acao.toLowerCase().includes(termo) ||
        item.entidade.toLowerCase().includes(termo) ||
        (item.usuario?.nome ?? '').toLowerCase().includes(termo) ||
        (item.usuario?.email ?? '').toLowerCase().includes(termo),
    );
  }, [data, busca]);

  const { fatia, pagina, totalPaginas, totalItens, setPagina, reiniciarPagina } =
    useListaPaginada(filtrados, POR_PAGINA);

  if (!organizacaoId) {
    return (
      <EstadoVazio
        titulo="Selecione uma organização"
        descricao="A trilha de auditoria é por organização."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Auditoria"
        descricao="Últimas ações registradas pela API (até 100 eventos)."
      />

      <Card>
        <CardHeader className="gap-3 space-y-0">
          <CardTitle>Eventos</CardTitle>
          <ToolbarFiltros>
            <Input
              placeholder="Buscar ação, entidade ou usuário"
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
                error instanceof Error ? error.message : 'Erro ao listar auditoria'
              }
              onTentarNovamente={() => void refetch()}
            />
          ) : null}
          {!isLoading && !isError && fatia.length === 0 ? (
            <EstadoVazio
              titulo="Sem eventos"
              descricao="Ações como login, criação de cobrança e webhooks aparecem aqui."
            />
          ) : null}
          {!isLoading && !isError && fatia.length > 0 ? (
            <>
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quando</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fatia.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatarData(item.criadoEm)}</TableCell>
                        <TableCell className="font-medium">{item.acao}</TableCell>
                        <TableCell>{item.entidade}</TableCell>
                        <TableCell>
                          {item.usuario
                            ? `${item.usuario.nome} (${item.usuario.email})`
                            : 'sistema'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.entidadeId ?? '-'}
                        </TableCell>
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

export default function PaginaAuditoria() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ConteudoAuditoria />
    </Suspense>
  );
}
