import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Ambiente } from '../../config/ambiente';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Ambiente, true>,
    private readonly auditoria: AuditoriaService,
  ) {}

  async registrar(dados: RegistrarDto) {
    const email = dados.email.toLowerCase().trim();
    const existente = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existente) {
      throw new ConflictException('Já existe uma conta com este e-mail');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dados.nome.trim(),
        email,
        senhaHash,
      },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    await this.auditoria.registrar({
      usuarioId: usuario.id,
      acao: 'USUARIO_REGISTRADO',
      entidade: 'Usuario',
      entidadeId: usuario.id,
    });

    return {
      usuario,
      acesso: await this.gerarToken(usuario.id, usuario.email),
    };
  }

  async entrar(dados: EntrarDto) {
    const email = dados.email.toLowerCase().trim();
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const senhaOk = await bcrypt.compare(dados.senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    await this.auditoria.registrar({
      usuarioId: usuario.id,
      acao: 'USUARIO_ENTROU',
      entidade: 'Usuario',
      entidadeId: usuario.id,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm,
      },
      acesso: await this.gerarToken(usuario.id, usuario.email),
    };
  }

  async obterPerfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        membros: {
          include: {
            organizacao: {
              select: { id: true, nome: true, documento: true },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  private async gerarToken(usuarioId: string, email: string) {
    const token = await this.jwt.signAsync(
      { sub: usuarioId, email },
      {
        secret: this.config.get('JWT_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_EXPIRES_IN', { infer: true }),
      },
    );

    return {
      token,
      tipo: 'Bearer',
      expiraEm: this.config.get('JWT_EXPIRES_IN', { infer: true }),
    };
  }
}
