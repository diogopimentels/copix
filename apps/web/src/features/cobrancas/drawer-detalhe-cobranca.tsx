'use client';

import { useQuery } from '@tanstack/react-query';
import { BadgeStatusCobranca } from '@/components/shared/status-badge';
import { EstadoErro } from '@/components/shared/estado-erro';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cobrancasServico } from '@/lib/api';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';

type Props = {
  cobrancaId: string | null;
  aberto: boolean;
  onFechar: () => void;
};

export function DrawerDetalheCobranca({ cobrancaId, aberto, onFechar }: Props) {
  const detalhe = useQuery({
    queryKey: ['cobranca', cobrancaId],
    queryFn: () => cobrancasServico.obter(cobrancaId!),
    enabled: aberto && Boolean(cobrancaId),
  });

  return (
    <Sheet
      open={aberto}
      onOpenChange={(open) => {
        if (!open) onFechar();
      }}
    >
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Detalhe da cobrança</SheetTitle>
          <SheetDescription>Informações da cobrança selecionada.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          {detalhe.isLoading ? <Skeleton className="h-40 w-full" /> : null}
          {detalhe.isError ? (
            <EstadoErro
              mensagem={
                detalhe.error instanceof Error
                  ? detalhe.error.message
                  : 'Falha ao carregar cobrança'
              }
              onTentarNovamente={() => void detalhe.refetch()}
            />
          ) : null}
          {detalhe.data ? (
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <BadgeStatusCobranca status={detalhe.data.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Descrição</dt>
                <dd className="mt-1 font-medium">{detalhe.data.descricao}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Valor</dt>
                <dd className="mt-1">{formatarMoeda(detalhe.data.valorCentavos)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Txid</dt>
                <dd className="mt-1 font-mono text-xs break-all">{detalhe.data.txid}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Criada em</dt>
                <dd className="mt-1">{formatarData(detalhe.data.criadoEm)}</dd>
              </div>
              {detalhe.data.vencimentoEm ? (
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Vencimento</dt>
                  <dd className="mt-1">{formatarData(detalhe.data.vencimentoEm)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
