import { Module, forwardRef } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ConciliacaoModule } from '../conciliacao/conciliacao.module';
import { LancamentosModule } from '../lancamentos/lancamentos.module';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { ProvedoresModule } from '../provedores/provedores.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    ProvedoresModule,
    LancamentosModule,
    forwardRef(() => ConciliacaoModule),
    AuditoriaModule,
    OrganizacoesModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
