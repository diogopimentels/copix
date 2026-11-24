'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
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
import { useLancamentos, useResumoLancamentos } from '@/hooks/use-lancamentos';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

export default function PaginaLancamentos() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const lista = useLancamentos(organizacaoId);
  const resumo = useResumoLancamentos(organizacaoId);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<'TODOS' | 'CREDITO' | 'DEBITO'>('TODOS');

  const filtrados = useMemo(() => {
    return (lista.data ?? []).filter((item) => {
      const bateTipo = tipo === 'TODOS' || item.tipo === tipo;
      const bateBusca =
        item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        item.referenciaId.toLowerCase().includes(busca.toLowerCase());
      return bateTipo && bateBusca;
    });
  }, [lista.data, busca, tipo]);

  if (!organizacaoId) {
    return (
      <EstadoVazio
        titulo="Selecione uma organização"
        descricao="O extrato do razão depende da organização ativa."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Lançamentos"
        descricao="Extrato do razão. Valores sempre em centavos no backend."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Créditos</p>
            <CardTitle>
              {formatarMoeda(resumo.data?.creditoCentavos ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Débitos</p>
            <CardTitle>
              {formatarMoeda(resumo.data?.debitoCentavos ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <CardTitle>
              {formatarMoeda(resumo.data?.saldoCentavos ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-3 space-y-0">
          <CardTitle>Movimentações</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Buscar descrição ou referência"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value as 'TODOS' | 'CREDITO' | 'DEBITO')
              }
            >
              <option value="TODOS">Todos</option>
              <option value="CREDITO">CREDITO</option>
              <option value="DEBITO">DEBITO</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {lista.isLoading ? <Skeleton className="h-40 w-full" /> : null}
          {lista.isError ? (
            <EstadoErro
              mensagem={
                lista.error instanceof Error
                  ? lista.error.message
                  : 'Erro ao listar lançamentos'
              }
              onTentarNovamente={() => void lista.refetch()}
            />
          ) : null}
          {!lista.isLoading && !lista.isError && filtrados.length === 0 ? (
            <EstadoVazio
              titulo="Razão vazio"
              descricao="Os créditos entram quando um pagamento Pix é processado."
            />
          ) : null}
          {!lista.isLoading && !lista.isError && filtrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge
                        variant={item.tipo === 'CREDITO' ? 'sucesso' : 'alerta'}
                      >
                        {item.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{formatarMoeda(item.valorCentavos)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.referenciaTipo}:{item.referenciaId.slice(0, 8)}
                    </TableCell>
                    <TableCell>{formatarData(item.criadoEm)}</TableCell>
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
