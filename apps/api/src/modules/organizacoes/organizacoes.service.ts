import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CriarOrganizacaoDto } from './dto/criar-organizacao.dto';

@Injectable()
export class OrganizacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async criar(usuarioId: string, dados: CriarOrganizacaoDto) {
    const documento = dados.documento.replace(/\D/g, '');
    const existente = await this.prisma.organizacao.findUnique({
      where: { documento },
    });

    if (existente) {
      throw new ConflictException('Já existe organização com este CNPJ');
    }

    const organizacao = await this.prisma.$transaction(async (tx) => {
      const nova = await tx.organizacao.create({
        data: {
          nome: dados.nome.trim(),
          documento,
          membros: {
            create: {
              usuarioId,
              papel: 'ADMIN',
            },
          },
          provedores: {
            create: {
              nome: 'Simulador Pix Copix',
              tipo: 'SIMULADOR',
              chaveWebhook: randomBytes(24).toString('hex'),
            },
          },
        },
        include: {
          membros: true,
          provedores: true,
        },
      });

      return nova;
    });

    await this.auditoria.registrar({
      organizacaoId: organizacao.id,
      usuarioId,
      acao: 'ORGANIZACAO_CRIADA',
      entidade: 'Organizacao',
      entidadeId: organizacao.id,
      metadados: { documento },
    });

    return organizacao;
  }

  listarDoUsuario(usuarioId: string) {
    return this.prisma.organizacao.findMany({
      where: {
        membros: { some: { usuarioId } },
      },
      orderBy: { criadoEm: 'desc' },
      include: {
        membros: {
          where: { usuarioId },
          select: { papel: true },
        },
        _count: {
          select: {
            cobrancas: true,
            pagamentos: true,
            conciliacoes: true,
          },
        },
      },
    });
  }

  async obter(organizacaoId: string, usuarioId: string) {
    await this.garantirMembro(organizacaoId, usuarioId);

    const organizacao = await this.prisma.organizacao.findUnique({
      where: { id: organizacaoId },
      include: {
        provedores: true,
        membros: {
          include: {
            usuario: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
        _count: {
          select: {
            cobrancas: true,
            pagamentos: true,
            conciliacoes: true,
            lancamentos: true,
          },
        },
      },
    });

    if (!organizacao) {
      throw new NotFoundException('Organização não encontrada');
    }

    return organizacao;
  }

  async garantirMembro(organizacaoId: string, usuarioId: string) {
    const membro = await this.prisma.membroOrganizacao.findUnique({
      where: {
        usuarioId_organizacaoId: { usuarioId, organizacaoId },
      },
    });

    if (!membro) {
      throw new ForbiddenException('Você não faz parte desta organização');
    }

    return membro;
  }
}
