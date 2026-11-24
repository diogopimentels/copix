import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validarAmbiente } from './config/ambiente';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizacoesModule } from './modules/organizacoes/organizacoes.module';
import { ProvedoresModule } from './modules/provedores/provedores.module';
import { CobrancasModule } from './modules/cobrancas/cobrancas.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { LancamentosModule } from './modules/lancamentos/lancamentos.module';
import { ConciliacaoModule } from './modules/conciliacao/conciliacao.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { SaudeController } from './modules/saude/saude.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validarAmbiente,
    }),
    PrismaModule,
    AuthModule,
    OrganizacoesModule,
    ProvedoresModule,
    CobrancasModule,
    PagamentosModule,
    WebhooksModule,
    LancamentosModule,
    ConciliacaoModule,
    AuditoriaModule,
  ],
  controllers: [SaudeController],
})
export class AppModule {}
