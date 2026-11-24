import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type EntradaAuditoria = {
  organizacaoId?: string;
  usuarioId?: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  metadados?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  registrar(entrada: EntradaAuditoria) {
    return this.prisma.registroAuditoria.create({
      data: {
        organizacaoId: entrada.organizacaoId,
        usuarioId: entrada.usuarioId,
        acao: entrada.acao,
        entidade: entrada.entidade,
        entidadeId: entrada.entidadeId,
        metadados: entrada.metadados,
      },
    });
  }

  listarPorOrganizacao(organizacaoId: string) {
    return this.prisma.registroAuditoria.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'desc' },
      take: 100,
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
      },
    });
  }
}
