'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  chamarApi,
  formatarData,
  formatarMoeda,
  limparToken,
  lerToken,
} from '@/lib/api';
import type {
  Cobranca,
  Conciliacao,
  Organizacao,
  Pagamento,
  PainelConciliacao,
  ResumoLancamentos,
  Usuario,
} from '@/lib/tipos';

export default function PaginaPainel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [organizacaoId, setOrganizacaoId] = useState('');
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [conciliacoes, setConciliacoes] = useState<Conciliacao[]>([]);
  const [painel, setPainel] = useState<PainelConciliacao | null>(null);
  const [resumo, setResumo] = useState<ResumoLancamentos | null>(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [novaOrgNome, setNovaOrgNome] = useState('');
  const [novaOrgDoc, setNovaOrgDoc] = useState('');
  const [novaCobrancaDesc, setNovaCobrancaDesc] = useState('');
  const [novaCobrancaValor, setNovaCobrancaValor] = useState('29,90');

  const carregarDados = useCallback(async (id: string) => {
    const [listaCobrancas, listaPagamentos, listaConciliacoes, painelAtual, resumoAtual] =
      await Promise.all([
        chamarApi<Cobranca[]>(`/organizacoes/${id}/cobrancas`),
        chamarApi<Pagamento[]>(`/organizacoes/${id}/pagamentos`),
        chamarApi<Conciliacao[]>(`/organizacoes/${id}/conciliacoes`),
        chamarApi<PainelConciliacao>(`/organizacoes/${id}/conciliacoes/painel`),
        chamarApi<ResumoLancamentos>(`/organizacoes/${id}/lancamentos/resumo`),
      ]);

    setCobrancas(listaCobrancas);
    setPagamentos(listaPagamentos);
    setConciliacoes(listaConciliacoes);
    setPainel(painelAtual);
    setResumo(resumoAtual);
  }, []);

  useEffect(() => {
    if (!lerToken()) {
      router.replace('/');
      return;
    }

    async function iniciar() {
      try {
        const perfil = await chamarApi<Usuario>('/auth/eu');
        setUsuario(perfil);

        const lista = await chamarApi<Organizacao[]>('/organizacoes');
        setOrganizacoes(lista);

        const primeira = lista[0];
        if (primeira) {
          setOrganizacaoId(primeira.id);
          await carregarDados(primeira.id);
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar painel');
        limparToken();
        router.replace('/');
      } finally {
        setCarregando(false);
      }
    }

    void iniciar();
  }, [router, carregarDados]);

  async function trocarOrganizacao(id: string) {
    setOrganizacaoId(id);
    setErro('');
    try {
      await carregarDados(id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar dados');
    }
  }

  async function criarOrganizacao(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    try {
      const org = await chamarApi<Organizacao>('/organizacoes', {
        method: 'POST',
        body: JSON.stringify({
          nome: novaOrgNome,
          documento: novaOrgDoc.replace(/\D/g, ''),
        }),
      });
      setNovaOrgNome('');
      setNovaOrgDoc('');
      setAviso('Organização criada');
      const lista = await chamarApi<Organizacao[]>('/organizacoes');
      setOrganizacoes(lista);
      await trocarOrganizacao(org.id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar organização');
    }
  }

  async function criarCobranca(evento: FormEvent) {
    evento.preventDefault();
    if (!organizacaoId) return;
    setErro('');

    const valorCentavos = Math.round(
      Number(novaCobrancaValor.replace(/\./g, '').replace(',', '.')) * 100,
    );

    try {
      await chamarApi(`/organizacoes/${organizacaoId}/cobrancas`, {
        method: 'POST',
        body: JSON.stringify({
          descricao: novaCobrancaDesc,
          valorCentavos,
        }),
      });
      setNovaCobrancaDesc('');
      setAviso('Cobrança criada');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar cobrança');
    }
  }

  async function simularPagamento(cobrancaId: string) {
    if (!organizacaoId) return;
    setErro('');
    try {
      await chamarApi(`/organizacoes/${organizacaoId}/simulador/pagar`, {
        method: 'POST',
        body: JSON.stringify({ cobrancaId }),
      });
      setAviso('Pagamento simulado e conciliado');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao simular pagamento');
    }
  }

  async function executarConciliacao() {
    if (!organizacaoId) return;
    try {
      await chamarApi(`/organizacoes/${organizacaoId}/conciliacoes/executar`, {
        method: 'POST',
      });
      setAviso('Varredura de conciliação concluída');
      await carregarDados(organizacaoId);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro na varredura');
    }
  }

  function sair() {
    limparToken();
    router.replace('/');
  }

  if (carregando) {
    return (
      <main className="container" style={{ padding: '3rem 0' }}>
        <p>Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 0 4rem', display: 'grid', gap: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div>
          <p className="marca" style={{ margin: 0, fontSize: '1.8rem' }}>
            Copix
          </p>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--texto-suave)' }}>
            Olá, {usuario?.nome}
          </p>
        </div>
        <button className="botao secundario" type="button" onClick={sair}>
          Sair
        </button>
      </header>

      {(erro || aviso) && (
        <p className={erro ? 'erro-texto' : undefined} style={{ color: erro ? undefined : 'var(--ok)' }}>
          {erro || aviso}
        </p>
      )}

      <section className="painel grade dois">
        <div>
          <h2 style={{ marginTop: 0 }}>Organização</h2>
          <select
            value={organizacaoId}
            onChange={(e) => void trocarOrganizacao(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: 10,
              border: '1px solid var(--borda)',
              background: 'var(--fundo)',
              color: 'var(--texto)',
            }}
          >
            {organizacoes.length === 0 && <option value="">Nenhuma ainda</option>}
            {organizacoes.map((org) => (
              <option key={org.id} value={org.id}>
                {org.nome}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={criarOrganizacao} className="grade" style={{ gap: '0.7rem' }}>
          <h2 style={{ margin: 0 }}>Nova organização</h2>
          <input
            placeholder="Nome"
            value={novaOrgNome}
            onChange={(e) => setNovaOrgNome(e.target.value)}
            required
            style={estiloInput}
          />
          <input
            placeholder="CNPJ (só números)"
            value={novaOrgDoc}
            onChange={(e) => setNovaOrgDoc(e.target.value)}
            required
            style={estiloInput}
          />
          <button className="botao" type="submit">
            Criar
          </button>
        </form>
      </section>

      {organizacaoId && (
        <>
          <section className="grade tres">
            <article className="painel">
              <p style={{ color: 'var(--texto-suave)', margin: 0 }}>Saldo no razão</p>
              <p className="marca" style={{ fontSize: '1.6rem', margin: '0.4rem 0 0' }}>
                {formatarMoeda(resumo?.saldoCentavos ?? 0)}
              </p>
            </article>
            <article className="painel">
              <p style={{ color: 'var(--texto-suave)', margin: 0 }}>Conciliadas</p>
              <p className="marca" style={{ fontSize: '1.6rem', margin: '0.4rem 0 0' }}>
                {painel?.conciliadas ?? 0}
              </p>
            </article>
            <article className="painel">
              <p style={{ color: 'var(--texto-suave)', margin: 0 }}>Divergentes</p>
              <p className="marca" style={{ fontSize: '1.6rem', margin: '0.4rem 0 0' }}>
                {painel?.divergentes ?? 0}
              </p>
            </article>
          </section>

          <section className="painel">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Cobranças</h2>
              <button className="botao secundario" type="button" onClick={() => void executarConciliacao()}>
                Rodar conciliação
              </button>
            </div>

            <form
              onSubmit={criarCobranca}
              className="grade dois"
              style={{ marginTop: '1rem', marginBottom: '1rem' }}
            >
              <input
                placeholder="Descrição"
                value={novaCobrancaDesc}
                onChange={(e) => setNovaCobrancaDesc(e.target.value)}
                required
                style={estiloInput}
              />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  placeholder="Valor (ex: 29,90)"
                  value={novaCobrancaValor}
                  onChange={(e) => setNovaCobrancaValor(e.target.value)}
                  required
                  style={estiloInput}
                />
                <button className="botao" type="submit">
                  Criar
                </button>
              </div>
            </form>

            <table className="tabela">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Txid</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cobrancas.map((cobranca) => (
                  <tr key={cobranca.id}>
                    <td>{cobranca.descricao}</td>
                    <td>{formatarMoeda(cobranca.valorCentavos)}</td>
                    <td>
                      <span
                        className={`badge ${
                          cobranca.status === 'PAGA'
                            ? 'ok'
                            : cobranca.status === 'PENDENTE'
                              ? 'alerta'
                              : 'erro'
                        }`}
                      >
                        {cobranca.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {cobranca.txid}
                    </td>
                    <td>
                      {cobranca.status === 'PENDENTE' && (
                        <button
                          className="botao"
                          type="button"
                          onClick={() => void simularPagamento(cobranca.id)}
                        >
                          Simular Pix
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="painel">
            <h2 style={{ marginTop: 0 }}>Pagamentos recebidos</h2>
            <table className="tabela">
              <thead>
                <tr>
                  <th>End-to-end</th>
                  <th>Valor</th>
                  <th>Recebido em</th>
                  <th>Provedor</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {pagamento.endToEndId}
                    </td>
                    <td>{formatarMoeda(pagamento.valorCentavos)}</td>
                    <td>{formatarData(pagamento.recebidoEm)}</td>
                    <td>{pagamento.provedor?.nome ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="painel">
            <h2 style={{ marginTop: 0 }}>Conciliações</h2>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Cobrança</th>
                  <th>Pagamento</th>
                  <th>Obs</th>
                </tr>
              </thead>
              <tbody>
                {conciliacoes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'CONCILIADO'
                            ? 'ok'
                            : item.status === 'DIVERGENTE'
                              ? 'erro'
                              : 'alerta'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.cobranca?.descricao ?? '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {item.pagamento?.endToEndId ?? '-'}
                    </td>
                    <td>{item.motivoDivergencia ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}

const estiloInput: CSSProperties = {
  width: '100%',
  border: '1px solid var(--borda)',
  borderRadius: 10,
  padding: '0.7rem 0.9rem',
  background: 'var(--fundo)',
  color: 'var(--texto)',
};
