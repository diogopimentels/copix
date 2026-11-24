import { z } from 'zod';

export const schemaEntrar = z.object({
  email: z.string().email('Informe um e-mail válido'),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

export const schemaRegistrar = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail válido'),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

export type DadosEntrar = z.infer<typeof schemaEntrar>;
export type DadosRegistrar = z.infer<typeof schemaRegistrar>;
