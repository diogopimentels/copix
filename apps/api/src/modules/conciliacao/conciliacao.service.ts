import { Injectable } from '@nestjs/common';
import { StatusConciliacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';

type RegistrarParEntrada = {
  organizacaoId: string;
  cobrancaId?: string;
  pagamentoId?: string;
  status: StatusConciliacao;
  motivoDivergencia?: string | null;
};

@Injectable()
export class ConciliacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizacoes: OrganizacoesService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async registrarPar(entrada: RegistrarParEntrada) {
    return this.prisma.conciliacao.create({
      data: {
        organizacaoId: entrada.organizacaoId,
        cobrancaId: entrada.cobrancaId,
        pagamentoId: entrada.pagamentoId,
        status: entrada.status,
        motivoDivergencia: entrada.motivoDivergencia,
        conciliadoEm: entrada.status === 'CONCILIADO' ? new Date() : null,
      },
    });
  }

  async listar(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);
    return this.prisma.conciliacao.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'desc' },
      include: {
        cobranca: {
          select: {
            id: true,
            txid: true,
            valorCentavos: true,
            status: true,
            descricao: true,
          },
        },
        pagamento: {
          select: {
            id: true,
            endToEndId: true,
            valorCentavos: true,
            txid: true,
            status: true,
          },
        },
      },
    });
  }

  async executarVarredura(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);

    const cobrancasPendentes = await this.prisma.cobranca.findMany({
      where: { organizacaoId, status: 'PENDENTE' },
    });

    const pagamentosSoltos = await this.prisma.pagamento.findMany({
      where: {
        organizacaoId,
        OR: [{ cobrancaId: null }, { conciliacoes: { none: {} } }],
      },
    });

    let criados = 0;

    for (const pagamento of pagamentosSoltos) {
      if (!pagamento.txid) continue;

      const cobranca = cobrancasPendentes.find((c) => c.txid === pagamento.txid);
      if (!cobranca) continue;

      const jaExiste = await this.prisma.conciliacao.findFirst({
        where: {
          organizacaoId,
          cobrancaId: cobranca.id,
          pagamentoId: pagamento.id,
        },
      });

      if (jaExiste) continue;

      const valoresBatam = cobranca.valorCentavos === pagamento.valorCentavos;

      await this.prisma.$transaction(async (tx) => {
        await tx.pagamento.update({
          where: { id: pagamento.id },
          data: { cobrancaId: cobranca.id },
        });

        if (valoresBatam) {
          await tx.cobranca.update({
            where: { id: cobranca.id },
            data: { status: 'PAGA', pagoEm: new Date() },
          });
        }

        await tx.conciliacao.create({
          data: {
            organizacaoId,
            cobrancaId: cobranca.id,
            pagamentoId: pagamento.id,
            status: valoresBatam ? 'CONCILIADO' : 'DIVERGENTE',
            motivoDivergencia: valoresBatam
              ? null
              : `Valor divergente na varredura`,
            conciliadoEm: valoresBatam ? new Date() : null,
          },
        });
      });

      criados += 1;
    }

    await this.auditoria.registrar({
      organizacaoId,
      usuarioId,
      acao: 'CONCILIACAO_VARREDURA',
      entidade: 'Conciliacao',
      metadados: { paresCriados: criados },
    });

    return {
      paresCriados: criados,
      itens: await this.listar(organizacaoId, usuarioId),
    };
  }

  async painel(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);

    const [porStatus, cobrancasPendentes, pagamentosSemPar] = await Promise.all([
      this.prisma.conciliacao.groupBy({
        by: ['status'],
        where: { organizacaoId },
        _count: { _all: true },
      }),
      this.prisma.cobranca.count({
        where: { organizacaoId, status: 'PENDENTE' },
      }),
      this.prisma.pagamento.count({
        where: {
          organizacaoId,
          conciliacoes: { none: {} },
        },
      }),
    ]);

    return {
      conciliadas:
        porStatus.find((s) => s.status === 'CONCILIADO')?._count._all ?? 0,
      divergentes:
        porStatus.find((s) => s.status === 'DIVERGENTE')?._count._all ?? 0,
      pendentes:
        porStatus.find((s) => s.status === 'PENDENTE')?._count._all ?? 0,
      cobrancasPendentes,
      pagamentosSemPar,
    };
  }
}
