import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LancamentosService } from './lancamentos.service';

@Controller('organizacoes/:organizacaoId/lancamentos')
@UseGuards(JwtAuthGuard)
export class LancamentosController {
  constructor(private readonly lancamentosService: LancamentosService) {}

  @Get('resumo')
  resumo(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.lancamentosService.resumo(organizacaoId, usuario.id);
  }

  @Get()
  listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.lancamentosService.listar(organizacaoId, usuario.id);
  }
}
