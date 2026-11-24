import { z } from 'zod';

export const schemaCriarCobranca = z.object({
  descricao: z.string().min(3, 'Descreva a cobrança'),
  valor: z
    .string()
    .min(1, 'Informe o valor')
    .refine((valor) => {
      const limpo = valor.trim().replace(/\./g, '').replace(',', '.');
      const numero = Number(limpo);
      return !Number.isNaN(numero) && numero > 0;
    }, 'Valor inválido'),
  vencimentoEm: z.string().optional(),
});

export type DadosCriarCobranca = z.infer<typeof schemaCriarCobranca>;
