'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { BadgeStatusCobranca } from '@/components/shared/status-badge';
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
import { FormularioCriarCobranca } from '@/features/cobrancas/formulario-criar-cobranca';
import { useCobrancas, useSimularPagamento } from '@/hooks/use-cobrancas';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';
import type { StatusCobranca } from '@/types/dominio';

const POR_PAGINA = 8;

export default function PaginaCobrancas() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = useCobrancas(organizacaoId);
  const simular = useSimularPagamento(organizacaoId);

  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<'TODOS' | StatusCobranca>('TODOS');
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const lista = data ?? [];
    return lista.filter((item) => {
      const bateBusca =
        item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        item.txid.toLowerCase().includes(busca.toLowerCase());
      const bateStatus = status === 'TODOS' || item.status === status;
      return bateBusca && bateStatus;
    });
  }, [data, busca, status]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const fatia = filtradas.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA,
  );

  async function simularPix(cobrancaId: string) {
    try {
      await simular.mutateAsync(cobrancaId);
      toast.success('Pagamento simulado');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao simular');
    }
  }

  if (!organizacaoId) {
    return (
      <EstadoVazio
        titulo="Selecione uma organização"
        descricao="As cobranças ficam vinculadas à organização ativa."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Cobranças"
        descricao="Emita cobranças Pix, acompanhe status e simule recebimento."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nova cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioCriarCobranca
            organizacaoId={organizacaoId}
            onCriado={() => setPagina(1)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3 space-y-0">
          <CardTitle>Lista</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Buscar por descrição ou txid"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
            />
            <select
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'TODOS' | StatusCobranca);
                setPagina(1);
              }}
            >
              <option value="TODOS">Todos os status</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="PAGA">PAGA</option>
              <option value="EXPIRADA">EXPIRADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : null}
          {isError ? (
            <EstadoErro
              mensagem={
                error instanceof Error ? error.message : 'Erro ao listar cobranças'
              }
              onTentarNovamente={() => void refetch()}
            />
          ) : null}
          {!isLoading && !isError && fatia.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma cobrança encontrada"
              descricao="Ajuste os filtros ou crie a primeira cobrança."
            />
          ) : null}
          {!isLoading && !isError && fatia.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Txid</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fatia.map((cobranca) => (
                    <TableRow key={cobranca.id}>
                      <TableCell>{cobranca.descricao}</TableCell>
                      <TableCell>{formatarMoeda(cobranca.valorCentavos)}</TableCell>
                      <TableCell>
                        <BadgeStatusCobranca status={cobranca.status} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cobranca.txid}</TableCell>
                      <TableCell>{formatarData(cobranca.criadoEm)}</TableCell>
                      <TableCell className="text-right">
                        {cobranca.status === 'PENDENTE' ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={simular.isPending}
                            onClick={() => void simularPix(cobranca.id)}
                          >
                            Simular Pix
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {filtradas.length} resultado(s)
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
