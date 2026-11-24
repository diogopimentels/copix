import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Publico } from '../../common/decorators/publico.decorator';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('registrar')
  registrar(@Body() dados: RegistrarDto) {
    return this.authService.registrar(dados);
  }

  @Publico()
  @Post('entrar')
  entrar(@Body() dados: EntrarDto) {
    return this.authService.entrar(dados);
  }

  @Get('eu')
  eu(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.authService.obterPerfil(usuario.id);
  }
}
