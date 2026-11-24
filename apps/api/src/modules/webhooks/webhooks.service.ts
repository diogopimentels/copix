import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ConciliacaoService } from '../conciliacao/conciliacao.service';
import { LancamentosService } from '../lancamentos/lancamentos.service';
import { ProvedoresService } from '../provedores/provedores.service';
import { PayloadPixDto } from './dto/payload-pix.dto';
import { SimularPagamentoDto } from './dto/simular-pagamento.dto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provedores: ProvedoresService,
    private readonly lancamentos: LancamentosService,
    private readonly conciliacao: ConciliacaoService,
    private readonly auditoria: AuditoriaService,
  ) {}

  assinarPayload(chave: string, corpoBruto: string) {
    return createHmac('sha256', chave).update(corpoBruto).digest('hex');
  }

  validarAssinatura(chave: string, corpoBruto: string, assinatura: string) {
    const esperada = this.assinarPayload(chave, corpoBruto);
    const a = Buffer.from(esperada);
    const b = Buffer.from(assinatura);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }
  }

  async receberPix(
    provedorId: string,
    assinatura: string,
    corpoBruto: string,
    payload: PayloadPixDto,
  ) {
    const provedor = await this.provedores.obterPorId(provedorId);
    this.validarAssinatura(provedor.chaveWebhook, corpoBruto, assinatura);

    const evento = await this.prisma.eventoWebhook.create({
      data: {
        provedorId,
        assinatura,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    try {
      const pagamento = await this.processarPagamento(provedor.organizacaoId, provedorId, payload);

      await this.prisma.eventoWebhook.update({
        where: { id: evento.id },
        data: { processado: true },
      });

      await this.auditoria.registrar({
        organizacaoId: provedor.organizacaoId,
        acao: 'WEBHOOK_PIX_PROCESSADO',
        entidade: 'Pagamento',
        entidadeId: pagamento.id,
        metadados: { endToEndId: payload.endToEndId },
      });

      return { ok: true, pagamentoId: pagamento.id };
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'erro desconhecido';
      await this.prisma.eventoWebhook.update({
        where: { id: evento.id },
        data: { erro: mensagem },
      });
      throw erro;
    }
  }

  async simularPagamento(
    organizacaoId: string,
    usuarioId: string,
    dados: SimularPagamentoDto,
  ) {
    const cobranca = await this.prisma.cobranca.findFirst({
      where: { id: dados.cobrancaId, organizacaoId },
    });

    if (!cobranca) {
      throw new BadRequestException('Cobrança não encontrada nesta organização');
    }

    if (cobranca.status !== 'PENDENTE') {
      throw new BadRequestException('Só dá pra simular pagamento em cobrança pendente');
    }

    const provedor = await this.prisma.provedor.findFirst({
      where: { organizacaoId, ativo: true, tipo: 'SIMULADOR' },
      orderBy: { criadoEm: 'asc' },
    });

    if (!provedor) {
      throw new BadRequestException('Nenhum provedor simulador ativo');
    }

    const payload: PayloadPixDto = {
      endToEndId: `E${randomBytes(15).toString('hex')}`.slice(0, 32),
      txid: cobranca.txid,
      valorCentavos: dados.valorCentavos ?? cobranca.valorCentavos,
      horario: new Date().toISOString(),
    };

    const corpoBruto = JSON.stringify(payload);
    const assinatura = this.assinarPayload(provedor.chaveWebhook, corpoBruto);

    const resultado = await this.receberPix(
      provedor.id,
      assinatura,
      corpoBruto,
      payload,
    );

    await this.auditoria.registrar({
      organizacaoId,
      usuarioId,
      acao: 'PAGAMENTO_SIMULADO',
      entidade: 'Cobranca',
      entidadeId: cobranca.id,
    });

    return resultado;
  }

  private async processarPagamento(
    organizacaoId: string,
    provedorId: string,
    payload: PayloadPixDto,
  ) {
    const existente = await this.prisma.pagamento.findUnique({
      where: { endToEndId: payload.endToEndId },
    });

    if (existente) {
      return existente;
    }

    const cobranca = payload.txid
      ? await this.prisma.cobranca.findUnique({ where: { txid: payload.txid } })
      : null;

    const pagamento = await this.prisma.pagamento.create({
      data: {
        organizacaoId,
        provedorId,
        cobrancaId: cobranca?.id,
        endToEndId: payload.endToEndId,
        txid: payload.txid,
        valorCentavos: payload.valorCentavos,
        payloadBruto: payload as unknown as Prisma.InputJsonValue,
        recebidoEm: payload.horario ? new Date(payload.horario) : new Date(),
      },
    });

    await this.lancamentos.registrarCredito({
      organizacaoId,
      valorCentavos: payload.valorCentavos,
      descricao: `Pix recebido ${payload.endToEndId}`,
      referenciaTipo: 'Pagamento',
      referenciaId: pagamento.id,
    });

    if (cobranca) {
      const valoresBatam = cobranca.valorCentavos === payload.valorCentavos;

      if (valoresBatam && cobranca.status === 'PENDENTE') {
        await this.prisma.cobranca.update({
          where: { id: cobranca.id },
          data: { status: 'PAGA', pagoEm: new Date() },
        });
      }

      await this.conciliacao.registrarPar({
        organizacaoId,
        cobrancaId: cobranca.id,
        pagamentoId: pagamento.id,
        status: valoresBatam ? 'CONCILIADO' : 'DIVERGENTE',
        motivoDivergencia: valoresBatam
          ? null
          : `Valor divergente: cobrança ${cobranca.valorCentavos} vs pagamento ${payload.valorCentavos}`,
      });
    } else {
      await this.conciliacao.registrarPar({
        organizacaoId,
        pagamentoId: pagamento.id,
        status: 'PENDENTE',
        motivoDivergencia: 'Pagamento sem cobrança correspondente (txid ausente)',
      });
    }

    return pagamento;
  }
}
