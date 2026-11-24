import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';

type CreditoEntrada = {
  organizacaoId: string;
  valorCentavos: number;
  descricao: string;
  referenciaTipo: string;
  referenciaId: string;
};

@Injectable()
export class LancamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizacoes: OrganizacoesService,
  ) {}

  registrarCredito(entrada: CreditoEntrada) {
    return this.prisma.lancamento.create({
      data: {
        organizacaoId: entrada.organizacaoId,
        tipo: 'CREDITO',
        valorCentavos: entrada.valorCentavos,
        descricao: entrada.descricao,
        referenciaTipo: entrada.referenciaTipo,
        referenciaId: entrada.referenciaId,
      },
    });
  }

  async listar(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);
    return this.prisma.lancamento.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async resumo(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);

    const agrupado = await this.prisma.lancamento.groupBy({
      by: ['tipo'],
      where: { organizacaoId },
      _sum: { valorCentavos: true },
    });

    const credito =
      agrupado.find((item) => item.tipo === 'CREDITO')?._sum.valorCentavos ?? 0;
    const debito =
      agrupado.find((item) => item.tipo === 'DEBITO')?._sum.valorCentavos ?? 0;

    return {
      creditoCentavos: credito,
      debitoCentavos: debito,
      saldoCentavos: credito - debito,
    };
  }
}
