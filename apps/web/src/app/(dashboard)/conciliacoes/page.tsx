'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { BadgeStatusConciliacao } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
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
import {
  useConciliacoes,
  useExecutarConciliacao,
  usePainelConciliacao,
} from '@/hooks/use-conciliacoes';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { formatarMoeda } from '@/lib/utils/formatadores';
import type { StatusConciliacao } from '@/types/dominio';

export default function PaginaConciliacoes() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const lista = useConciliacoes(organizacaoId);
  const painel = usePainelConciliacao(organizacaoId);
  const executar = useExecutarConciliacao(organizacaoId);
  const [status, setStatus] = useState<'TODOS' | StatusConciliacao>('TODOS');

  const filtradas = useMemo(() => {
    return (lista.data ?? []).filter(
      (item) => status === 'TODOS' || item.status === status,
    );
  }, [lista.data, status]);

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
          <Button
            type="button"
            onClick={() => void rodar()}
            disabled={executar.isPending}
          >
            {executar.isPending ? 'Executando...' : 'Executar conciliação'}
          </Button>
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
            <CardTitle>{painel.data?.divergentes ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Histórico</CardTitle>
          <select
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'TODOS' | StatusConciliacao)}
          >
            <option value="TODOS">Todos</option>
            <option value="CONCILIADO">CONCILIADO</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="DIVERGENTE">DIVERGENTE</option>
          </select>
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
              titulo="Nenhuma conciliação"
              descricao="Crie uma cobrança e simule o Pix para gerar o primeiro pareamento."
            />
          ) : null}
          {!lista.isLoading && !lista.isError && filtradas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Cobrança</TableHead>
                  <TableHead>Valor cobrado</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor pago</TableHead>
                  <TableHead>Obs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <BadgeStatusConciliacao status={item.status} />
                    </TableCell>
                    <TableCell>{item.cobranca?.descricao ?? '-'}</TableCell>
                    <TableCell>
                      {item.cobranca
                        ? formatarMoeda(item.cobranca.valorCentavos)
                        : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.pagamento?.endToEndId ?? '-'}
                    </TableCell>
                    <TableCell>
                      {item.pagamento
                        ? formatarMoeda(item.pagamento.valorCentavos)
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs text-muted-foreground">
                      {item.motivoDivergencia ?? '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
