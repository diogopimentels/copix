import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { CobrancasController } from './cobrancas.controller';
import { CobrancasService } from './cobrancas.service';

@Module({
  imports: [OrganizacoesModule, AuditoriaModule],
  controllers: [CobrancasController],
  providers: [CobrancasService],
  exports: [CobrancasService],
})
export class CobrancasModule {}
