import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { ProvedoresController } from './provedores.controller';
import { ProvedoresService } from './provedores.service';

@Module({
  imports: [OrganizacoesModule, AuditoriaModule],
  controllers: [ProvedoresController],
  providers: [ProvedoresService],
  exports: [ProvedoresService],
})
export class ProvedoresModule {}
