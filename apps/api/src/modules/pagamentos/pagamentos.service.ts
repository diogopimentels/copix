import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';

@Injectable()
export class PagamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizacoes: OrganizacoesService,
  ) {}

  async listar(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);
    return this.prisma.pagamento.findMany({
      where: { organizacaoId },
      orderBy: { recebidoEm: 'desc' },
      include: {
        provedor: { select: { id: true, nome: true } },
        cobranca: {
          select: { id: true, txid: true, valorCentavos: true, status: true },
        },
      },
    });
  }
}
