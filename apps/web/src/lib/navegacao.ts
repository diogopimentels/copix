import {
  ArrowLeftRight,
  Building2,
  CreditCard,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  Wallet,
} from 'lucide-react';

export const ITENS_NAVEGACAO = [
  { href: '/dashboard', label: 'Dashboard', icone: LayoutDashboard },
  { href: '/cobrancas', label: 'Cobranças', icone: Receipt },
  { href: '/pagamentos', label: 'Pagamentos', icone: CreditCard },
  { href: '/conciliacoes', label: 'Conciliações', icone: ArrowLeftRight },
  { href: '/lancamentos', label: 'Lançamentos', icone: Wallet },
  { href: '/auditoria', label: 'Auditoria', icone: ScrollText },
  { href: '/configuracoes', label: 'Configurações', icone: Settings },
] as const;

export const ITEM_ORG = {
  href: '/configuracoes',
  label: 'Organização',
  icone: Building2,
} as const;
