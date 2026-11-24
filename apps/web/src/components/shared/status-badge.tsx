import { Badge } from '@/components/ui/badge';
import type { StatusCobranca, StatusConciliacao } from '@/types/dominio';

export function BadgeStatusCobranca({ status }: { status: StatusCobranca }) {
  const variant =
    status === 'PAGA' ? 'sucesso' : status === 'PENDENTE' ? 'alerta' : 'erro';
  return <Badge variant={variant}>{status}</Badge>;
}

export function BadgeStatusConciliacao({ status }: { status: StatusConciliacao }) {
  const variant =
    status === 'CONCILIADO' ? 'sucesso' : status === 'DIVERGENTE' ? 'erro' : 'alerta';
  return <Badge variant={variant}>{status}</Badge>;
}
