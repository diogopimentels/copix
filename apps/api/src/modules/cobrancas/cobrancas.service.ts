import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';
import { CriarCobrancaDto } from './dto/criar-cobranca.dto';

@Injectable()
export class CobrancasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizacoes: OrganizacoesService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async criar(
    organizacaoId: string,
    usuarioId: string,
    dados: CriarCobrancaDto,
  ) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);

    const txid = this.gerarTxid();
    const cobranca = await this.prisma.cobranca.create({
      data: {
        organizacaoId,
        txid,
        valorCentavos: dados.valorCentavos,
        descricao: dados.descricao.trim(),
        vencimentoEm: dados.vencimentoEm
          ? new Date(dados.vencimentoEm)
          : null,
      },
    });

    await this.auditoria.registrar({
      organizacaoId,
      usuarioId,
      acao: 'COBRANCA_CRIADA',
      entidade: 'Cobranca',
      entidadeId: cobranca.id,
      metadados: {
        txid,
        valorCentavos: dados.valorCentavos,
      },
    });

    return cobranca;
  }

  async listar(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);
    return this.prisma.cobranca.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: { select: { pagamentos: true, conciliacoes: true } },
      },
    });
  }

  async obter(cobrancaId: string, usuarioId: string) {
    const cobranca = await this.prisma.cobranca.findUnique({
      where: { id: cobrancaId },
      include: {
        pagamentos: true,
        conciliacoes: true,
      },
    });

    if (!cobranca) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    await this.organizacoes.garantirMembro(cobranca.organizacaoId, usuarioId);
    return cobranca;
  }

  private gerarTxid() {
    // txid Pix: até 35 chars alfanuméricos
    return `copix${randomBytes(14).toString('hex')}`.slice(0, 35);
  }
}
