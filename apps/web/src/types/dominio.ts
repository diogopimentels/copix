export type Usuario = {
  id: string;
  nome: string;
  email: string;
  criadoEm?: string;
  membros?: Array<{
    papel: 'ADMIN' | 'OPERADOR';
    organizacao: {
      id: string;
      nome: string;
      documento: string;
    };
  }>;
};

export type Organizacao = {
  id: string;
  nome: string;
  documento: string;
  criadoEm?: string;
  provedores?: Provedor[];
  membros?: Array<{
    id: string;
    papel: 'ADMIN' | 'OPERADOR';
    usuario: {
      id: string;
      nome: string;
      email: string;
    };
  }>;
  _count?: {
    cobrancas: number;
    pagamentos: number;
    conciliacoes: number;
    lancamentos?: number;
  };
};

export type Provedor = {
  id: string;
  organizacaoId: string;
  nome: string;
  tipo: 'SIMULADOR';
  ativo: boolean;
  chaveWebhook: string;
  criadoEm: string;
};

export type StatusCobranca = 'PENDENTE' | 'PAGA' | 'EXPIRADA' | 'CANCELADA';

export type Cobranca = {
  id: string;
  organizacaoId?: string;
  txid: string;
  valorCentavos: number;
  descricao: string;
  status: StatusCobranca;
  vencimentoEm?: string | null;
  pagoEm?: string | null;
  criadoEm: string;
  atualizadoEm?: string;
};

export type Pagamento = {
  id: string;
  endToEndId: string;
  txid?: string | null;
  valorCentavos: number;
  status: 'RECEBIDO' | 'ESTORNADO' | string;
  recebidoEm: string;
  cobranca?: {
    id: string;
    txid: string;
    valorCentavos: number;
    status: string;
  } | null;
  provedor?: { id: string; nome: string };
};

export type StatusConciliacao = 'CONCILIADO' | 'DIVERGENTE' | 'PENDENTE';

export type Conciliacao = {
  id: string;
  status: StatusConciliacao;
  motivoDivergencia?: string | null;
  criadoEm: string;
  conciliadoEm?: string | null;
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

export type Lancamento = {
  id: string;
  tipo: 'CREDITO' | 'DEBITO';
  valorCentavos: number;
  descricao: string;
  referenciaTipo: string;
  referenciaId: string;
  criadoEm: string;
};

export type RegistroAuditoria = {
  id: string;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  metadados?: unknown;
  criadoEm: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  } | null;
};

export type RespostaAuth = {
  usuario: Usuario;
  acesso: {
    /** Ausente no browser após BFF — JWT fica só no cookie HttpOnly. */
    token?: string;
    tipo: string;
    expiraEm: string;
  };
};
