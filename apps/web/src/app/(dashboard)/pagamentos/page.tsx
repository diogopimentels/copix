'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { usePagamentos } from '@/hooks/use-pagamentos';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

const POR_PAGINA = 10;

export default function PaginaPagamentos() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = usePagamentos(organizacaoId);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return (data ?? []).filter(
      (item) =>
        item.endToEndId.toLowerCase().includes(termo) ||
        (item.txid ?? '').toLowerCase().includes(termo) ||
        (item.provedor?.nome ?? '').toLowerCase().includes(termo),
    );
  }, [data, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const fatia = filtrados.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA,
  );

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
          <Input
            placeholder="Buscar por end-to-end, txid ou provedor"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
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
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filtrados.length} resultado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual <= 1}
                    onClick={() => setPagina((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="self-center text-sm text-muted-foreground">
                    {paginaAtual}/{totalPaginas}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual >= totalPaginas}
                    onClick={() => setPagina((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
