import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CriarProvedorDto } from './dto/criar-provedor.dto';
import { ProvedoresService } from './provedores.service';

@Controller('organizacoes/:organizacaoId/provedores')
@UseGuards(JwtAuthGuard)
export class ProvedoresController {
  constructor(private readonly provedoresService: ProvedoresService) {}

  @Get()
  listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.provedoresService.listar(organizacaoId, usuario.id);
  }

  @Post()
  criar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
    @Body() dados: CriarProvedorDto,
  ) {
    return this.provedoresService.criar(organizacaoId, usuario.id, dados);
  }
}
