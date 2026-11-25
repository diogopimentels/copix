'use client';

import { BadgeStatusConciliacao } from '@/components/shared/status-badge';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatarData, formatarMoeda } from '@/lib/utils/formatadores';
import type { Conciliacao } from '@/types/dominio';

type Props = {
  item: Conciliacao | null;
  aberto: boolean;
  onFechar: () => void;
};

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium break-all">{valor}</dd>
    </div>
  );
}

export function DrawerDetalheConciliacao({ item, aberto, onFechar }: Props) {
  const cobrado = item?.cobranca?.valorCentavos;
  const pago = item?.pagamento?.valorCentavos;
  const delta =
    cobrado !== undefined && pago !== undefined ? pago - cobrado : null;

  return (
    <Sheet
      open={aberto}
      onOpenChange={(open) => {
        if (!open) onFechar();
      }}
    >
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Detalhe da conciliação</SheetTitle>
          <SheetDescription>
            Comparativo entre cobrança e pagamento.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {item ? (
            <div className="grid gap-6">
              <div className="flex items-center gap-3">
                <BadgeStatusConciliacao status={item.status} />
                <span className="text-sm text-muted-foreground">
                  {formatarData(item.criadoEm)}
                </span>
              </div>

              {item.status === 'DIVERGENTE' ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-destructive">Divergência</p>
                  <p className="mt-1 text-muted-foreground">
                    {item.motivoDivergencia ?? 'Motivo não informado'}
                  </p>
                  {delta !== null ? (
                    <p className="mt-2 font-mono text-sm">
                      Delta: {delta >= 0 ? '+' : ''}
                      {formatarMoeda(delta)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <section className="grid gap-3">
                <h3 className="text-sm font-semibold">Cobrança</h3>
                <dl className="grid gap-3 rounded-md border border-border p-3">
                  <Campo
                    rotulo="Descrição"
                    valor={item.cobranca?.descricao ?? '-'}
                  />
                  <Campo rotulo="Txid" valor={item.cobranca?.txid ?? '-'} />
                  <Campo
                    rotulo="Valor"
                    valor={
                      item.cobranca
                        ? formatarMoeda(item.cobranca.valorCentavos)
                        : '-'
                    }
                  />
                  <Campo rotulo="Status" valor={item.cobranca?.status ?? '-'} />
                </dl>
              </section>

              <section className="grid gap-3">
                <h3 className="text-sm font-semibold">Pagamento</h3>
                <dl className="grid gap-3 rounded-md border border-border p-3">
                  <Campo
                    rotulo="End-to-end"
                    valor={item.pagamento?.endToEndId ?? '-'}
                  />
                  <Campo
                    rotulo="Valor"
                    valor={
                      item.pagamento
                        ? formatarMoeda(item.pagamento.valorCentavos)
                        : '-'
                    }
                  />
                  <Campo rotulo="Txid" valor={item.pagamento?.txid ?? '-'} />
                  <Campo rotulo="Status" valor={item.pagamento?.status ?? '-'} />
                </dl>
              </section>
            </div>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
