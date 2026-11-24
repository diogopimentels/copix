import { Module } from '@nestjs/common';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { LancamentosController } from './lancamentos.controller';
import { LancamentosService } from './lancamentos.service';

@Module({
  imports: [OrganizacoesModule],
  controllers: [LancamentosController],
  providers: [LancamentosService],
  exports: [LancamentosService],
})
export class LancamentosModule {}
