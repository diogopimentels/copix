import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConciliacaoService } from './conciliacao.service';

@Controller('organizacoes/:organizacaoId/conciliacoes')
@UseGuards(JwtAuthGuard)
export class ConciliacaoController {
  constructor(private readonly conciliacaoService: ConciliacaoService) {}

  @Get('painel')
  painel(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.conciliacaoService.painel(organizacaoId, usuario.id);
  }

  @Post('executar')
  executar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.conciliacaoService.executarVarredura(organizacaoId, usuario.id);
  }

  @Get()
  listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.conciliacaoService.listar(organizacaoId, usuario.id);
  }
}
