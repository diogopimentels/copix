import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  Wallet,
} from 'lucide-react';

export const GRUPOS_NAVEGACAO = [
  {
    titulo: 'Visão geral',
    itens: [{ href: '/dashboard', label: 'Dashboard', icone: LayoutDashboard }],
  },
  {
    titulo: 'Operação',
    itens: [
      { href: '/cobrancas', label: 'Cobranças', icone: Receipt },
      { href: '/pagamentos', label: 'Pagamentos', icone: CreditCard },
      { href: '/conciliacoes', label: 'Conciliações', icone: ArrowLeftRight },
      { href: '/lancamentos', label: 'Lançamentos', icone: Wallet },
    ],
  },
  {
    titulo: 'Sistema',
    itens: [
      { href: '/auditoria', label: 'Auditoria', icone: ScrollText },
      { href: '/configuracoes', label: 'Configurações', icone: Settings },
    ],
  },
] as const;

/** Lista plana — útil para testes e redirects */
export const ITENS_NAVEGACAO = GRUPOS_NAVEGACAO.flatMap((g) => [...g.itens]);
