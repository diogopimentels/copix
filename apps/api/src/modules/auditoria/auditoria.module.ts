import { Module, forwardRef } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { OrganizacoesModule } from '../organizacoes/organizacoes.module';

@Module({
  imports: [forwardRef(() => OrganizacoesModule)],
  providers: [AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
