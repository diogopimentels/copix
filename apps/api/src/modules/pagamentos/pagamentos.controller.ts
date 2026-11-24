import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PagamentosService } from './pagamentos.service';

@Controller('organizacoes/:organizacaoId/pagamentos')
@UseGuards(JwtAuthGuard)
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get()
  listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.pagamentosService.listar(organizacaoId, usuario.id);
  }
}
