import { Module, forwardRef } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { ConciliacaoController } from './conciliacao.controller';
import { ConciliacaoService } from './conciliacao.service';

@Module({
  imports: [OrganizacoesModule, forwardRef(() => AuditoriaModule)],
  controllers: [ConciliacaoController],
  providers: [ConciliacaoService],
  exports: [ConciliacaoService],
})
export class ConciliacaoModule {}
