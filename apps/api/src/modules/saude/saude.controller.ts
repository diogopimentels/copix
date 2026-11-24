import { Controller, Get } from '@nestjs/common';

@Controller('saude')
export class SaudeController {
  @Get()
  verificar() {
    return {
      status: 'ok',
      servico: 'copix-api',
      horario: new Date().toISOString(),
    };
  }
}
