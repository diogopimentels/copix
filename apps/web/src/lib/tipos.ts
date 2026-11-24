export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

export type Organizacao = {
  id: string;
  nome: string;
  documento: string;
  _count?: {
    cobrancas: number;
    pagamentos: number;
    conciliacoes: number;
  };
};

export type Cobranca = {
  id: string;
  txid: string;
  valorCentavos: number;
  descricao: string;
  status: 'PENDENTE' | 'PAGA' | 'EXPIRADA' | 'CANCELADA';
  criadoEm: string;
  pagoEm?: string | null;
};

export type Pagamento = {
  id: string;
  endToEndId: string;
  txid?: string | null;
  valorCentavos: number;
  status: string;
  recebidoEm: string;
  cobranca?: { id: string; txid: string; valorCentavos: number; status: string } | null;
  provedor?: { id: string; nome: string };
};

export type Conciliacao = {
  id: string;
  status: 'CONCILIADO' | 'DIVERGENTE' | 'PENDENTE';
  motivoDivergencia?: string | null;
  criadoEm: string;
  cobranca?: {
    id: string;
    txid: string;
    valorCentavos: number;
    status: string;
    descricao: string;
  } | null;
  pagamento?: {
    id: string;
    endToEndId: string;
    valorCentavos: number;
    txid?: string | null;
    status: string;
  } | null;
};

export type PainelConciliacao = {
  conciliadas: number;
  divergentes: number;
  pendentes: number;
  cobrancasPendentes: number;
  pagamentosSemPar: number;
};

export type ResumoLancamentos = {
  creditoCentavos: number;
  debitoCentavos: number;
  saldoCentavos: number;
};
