import { z } from 'zod';

export const schemaCriarOrganizacao = z.object({
  nome: z.string().min(2, 'Informe o nome'),
  documento: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ precisa ter 14 dígitos numéricos'),
});

export type DadosCriarOrganizacao = z.infer<typeof schemaCriarOrganizacao>;
