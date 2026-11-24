import { requisitarApi } from '../cliente';

export const simuladorServico = {
  pagar(
    organizacaoId: string,
    dados: { cobrancaId: string; valorCentavos?: number },
  ) {
    return requisitarApi<{ ok: boolean; pagamentoId: string }>(
      `/organizacoes/${organizacaoId}/simulador/pagar`,
      {
        method: 'POST',
        body: dados,
      },
    );
  },
};
