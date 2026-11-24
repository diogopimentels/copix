import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';
import { CriarProvedorDto } from './dto/criar-provedor.dto';

@Injectable()
export class ProvedoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizacoes: OrganizacoesService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async listar(organizacaoId: string, usuarioId: string) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);
    return this.prisma.provedor.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async criar(
    organizacaoId: string,
    usuarioId: string,
    dados: CriarProvedorDto,
  ) {
    await this.organizacoes.garantirMembro(organizacaoId, usuarioId);

    const provedor = await this.prisma.provedor.create({
      data: {
        organizacaoId,
        nome: dados.nome.trim(),
        tipo: 'SIMULADOR',
        chaveWebhook: randomBytes(24).toString('hex'),
      },
    });

    await this.auditoria.registrar({
      organizacaoId,
      usuarioId,
      acao: 'PROVEDOR_CRIADO',
      entidade: 'Provedor',
      entidadeId: provedor.id,
    });

    return provedor;
  }

  async obterPorId(provedorId: string) {
    const provedor = await this.prisma.provedor.findUnique({
      where: { id: provedorId },
    });

    if (!provedor || !provedor.ativo) {
      throw new NotFoundException('Provedor não encontrado');
    }

    return provedor;
  }
}
