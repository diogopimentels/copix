import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type UsuarioAutenticado = {
  id: string;
  email: string;
};

export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const requisicao = contexto.switchToHttp().getRequest<{
      user: UsuarioAutenticado;
    }>();
    return requisicao.user;
  },
);
