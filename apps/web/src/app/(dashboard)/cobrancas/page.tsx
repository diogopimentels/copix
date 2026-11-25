'use client';

import { Suspense, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { BadgeStatusCobranca } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Paginacao } from '@/components/shared/paginacao';
import { TabelaResponsiva } from '@/components/shared/tabela-responsiva';
import { ToolbarFiltros } from '@/components/shared/toolbar-filtros';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { DrawerDetalheCobranca } from '@/features/cobrancas/drawer-detalhe-cobranca';
import { FormularioCriarCobranca } from '@/features/cobrancas/formulario-criar-cobranca';
import { useCobrancas, useSimularPagamento } from '@/hooks/use-cobrancas';
import { useListaPaginada } from '@/hooks/use-lista-paginada';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { useParametroBusca } from '@/hooks/use-parametro-busca';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';
import type { Cobranca, StatusCobranca } from '@/types/dominio';

const POR_PAGINA = 8;

function ConteudoCobrancas() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = useCobrancas(organizacaoId);
  const simular = useSimularPagamento(organizacaoId);

  const [busca, setBusca] = useParametroBusca('q');
  const [status, setStatus] = useParametroBusca('status', 'TODOS');
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);
  const [cobrancaParaSimular, setCobrancaParaSimular] = useState<Cobranca | null>(
    null,
  );
  const [cobrancaDetalheId, setCobrancaDetalheId] = useState<string | null>(null);
  const [simulandoId, setSimulandoId] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const lista = data ?? [];
    const termo = busca.toLowerCase();
    return lista.filter((item) => {
      const bateBusca =
        item.descricao.toLowerCase().includes(termo) ||
        item.txid.toLowerCase().includes(termo);
      const bateStatus =
        status === 'TODOS' || item.status === (status as StatusCobranca);
      return bateBusca && bateStatus;
    });
  }, [data, busca, status]);

  const { fatia, pagina, totalPaginas, totalItens, setPagina, reiniciarPagina } =
    useListaPaginada(filtradas, POR_PAGINA);

  async function confirmarSimulacao() {
    if (!cobrancaParaSimular) return;
    setSimulandoId(cobrancaParaSimular.id);
    try {
      await simular.mutateAsync(cobrancaParaSimular.id);
      toast.success('Pagamento simulado');
      setCobrancaParaSimular(null);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao simular');
    } finally {
      setSimulandoId(null);
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
        descricao="Crie e acompanhe cobranças Pix."
        acoes={
          <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
            <DialogTrigger asChild>
              <Button type="button">Nova cobrança</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova cobrança</DialogTitle>
                <DialogDescription>
                  Informe a descrição e o valor em reais.
                </DialogDescription>
              </DialogHeader>
              <FormularioCriarCobranca
                organizacaoId={organizacaoId}
                onCriado={() => {
                  reiniciarPagina();
                  setDialogCriarAberto(false);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="gap-3 space-y-0">
          <CardTitle>Lista</CardTitle>
          <ToolbarFiltros>
            <Input
              placeholder="Buscar por descrição ou txid"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                reiniciarPagina();
              }}
              className="sm:max-w-xs"
            />
            <NativeSelect
              className="sm:w-48"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                reiniciarPagina();
              }}
              aria-label="Filtrar por status"
            >
              <option value="TODOS">Todos os status</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="PAGA">PAGA</option>
              <option value="EXPIRADA">EXPIRADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </NativeSelect>
          </ToolbarFiltros>
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
              <TabelaResponsiva>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Txid</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fatia.map((cobranca) => (
                      <TableRow key={cobranca.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="text-left font-medium hover:underline"
                            onClick={() => setCobrancaDetalheId(cobranca.id)}
                          >
                            {cobranca.descricao}
                          </button>
                        </TableCell>
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
                              disabled={simulandoId === cobranca.id}
                              onClick={() => setCobrancaParaSimular(cobranca)}
                            >
                              {simulandoId === cobranca.id
                                ? 'Simulando...'
                                : 'Simular Pix'}
                            </Button>
                          ) : null}
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

      <ConfirmDialog
        aberto={Boolean(cobrancaParaSimular)}
        titulo="Simular pagamento Pix?"
        descricao={
          cobrancaParaSimular
            ? `Vai gerar um pagamento de ${formatarMoeda(cobrancaParaSimular.valorCentavos)} para “${cobrancaParaSimular.descricao}” e tentar conciliar automaticamente.`
            : ''
        }
        confirmarLabel="Simular agora"
        carregando={simular.isPending}
        onCancelar={() => setCobrancaParaSimular(null)}
        onConfirmar={confirmarSimulacao}
      />

      <DrawerDetalheCobranca
        cobrancaId={cobrancaDetalheId}
        aberto={Boolean(cobrancaDetalheId)}
        onFechar={() => setCobrancaDetalheId(null)}
      />
    </div>
  );
}

export default function PaginaCobrancas() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ConteudoCobrancas />
    </Suspense>
  );
}
