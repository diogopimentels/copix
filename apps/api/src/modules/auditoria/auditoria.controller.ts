import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';
import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { AuditoriaService } from './auditoria.service';

@Controller('organizacoes/:organizacaoId/auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly organizacoesService: OrganizacoesService,
  ) {}

  @Get()
  async listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    await this.organizacoesService.garantirMembro(organizacaoId, usuario.id);
    return this.auditoriaService.listarPorOrganizacao(organizacaoId);
  }
}
