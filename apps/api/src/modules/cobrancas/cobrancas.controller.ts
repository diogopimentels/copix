import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CriarCobrancaDto } from './dto/criar-cobranca.dto';
import { CobrancasService } from './cobrancas.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CobrancasController {
  constructor(private readonly cobrancasService: CobrancasService) {}

  @Post('organizacoes/:organizacaoId/cobrancas')
  criar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
    @Body() dados: CriarCobrancaDto,
  ) {
    return this.cobrancasService.criar(organizacaoId, usuario.id, dados);
  }

  @Get('organizacoes/:organizacaoId/cobrancas')
  listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.cobrancasService.listar(organizacaoId, usuario.id);
  }

  @Get('cobrancas/:cobrancaId')
  obter(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('cobrancaId') cobrancaId: string,
  ) {
    return this.cobrancasService.obter(cobrancaId, usuario.id);
  }
}
