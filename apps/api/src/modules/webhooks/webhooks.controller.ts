import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../common/decorators/usuario-atual.decorator';
import { Publico } from '../../common/decorators/publico.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';
import { PayloadPixDto } from './dto/payload-pix.dto';
import { SimularPagamentoDto } from './dto/simular-pagamento.dto';
import { WebhooksService } from './webhooks.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly organizacoes: OrganizacoesService,
  ) {}

  @Publico()
  @Post('webhooks/pix/:provedorId')
  receberPix(
    @Param('provedorId') provedorId: string,
    @Headers('x-copix-signature') assinatura: string | undefined,
    @Body() payload: PayloadPixDto,
    @Req() req: Request & { rawBody?: string },
  ) {
    const corpoBruto = req.rawBody ?? JSON.stringify(payload);
    return this.webhooksService.receberPix(
      provedorId,
      assinatura ?? '',
      corpoBruto,
      payload,
    );
  }

  @Post('organizacoes/:organizacaoId/simulador/pagar')
  async simular(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('organizacaoId') organizacaoId: string,
    @Body() dados: SimularPagamentoDto,
  ) {
    await this.organizacoes.garantirMembro(organizacaoId, usuario.id);
    return this.webhooksService.simularPagamento(
      organizacaoId,
      usuario.id,
      dados,
    );
  }
}
