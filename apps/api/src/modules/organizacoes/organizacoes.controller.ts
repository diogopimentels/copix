import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CriarOrganizacaoDto } from './dto/criar-organizacao.dto';
import { OrganizacoesService } from './organizacoes.service';

@Controller('organizacoes')
@UseGuards(JwtAuthGuard)
export class OrganizacoesController {
  constructor(private readonly organizacoesService: OrganizacoesService) {}

  @Post()
  criar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dados: CriarOrganizacaoDto,
  ) {
    return this.organizacoesService.criar(usuario.id, dados);
  }

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.organizacoesService.listarDoUsuario(usuario.id);
  }

  @Get(':organizacaoId')
  obter(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
  ) {
    return this.organizacoesService.obter(organizacaoId, usuario.id);
  }
}
