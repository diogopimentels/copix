import { Module } from '@nestjs/common';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

@Module({
  imports: [OrganizacoesModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}
