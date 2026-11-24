import { Module, forwardRef } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { OrganizacoesController } from './organizacoes.controller';
import { OrganizacoesService } from './organizacoes.service';

@Module({
  imports: [forwardRef(() => AuditoriaModule)],
  controllers: [OrganizacoesController],
  providers: [OrganizacoesService],
  exports: [OrganizacoesService],
})
export class OrganizacoesModule {}
