'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
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
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { formatarData } from '@/lib/utils/formatadores';

export default function PaginaAuditoria() {
  const { organizacaoId } = useOrganizacaoAtiva();
  const { data, isLoading, isError, error, refetch } = useAuditoria(organizacaoId);
  const [busca, setBusca] = useState('');

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
          <Input
            placeholder="Buscar ação, entidade ou usuário"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
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
          {!isLoading && !isError && filtrados.length === 0 ? (
            <EstadoVazio
              titulo="Sem eventos"
              descricao="Ações como login, criação de cobrança e webhooks aparecem aqui."
            />
          ) : null}
          {!isLoading && !isError && filtrados.length > 0 ? (
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
                {filtrados.map((item) => (
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
