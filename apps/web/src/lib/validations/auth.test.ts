import { describe, expect, it } from 'vitest';
import { schemaEntrar, schemaRegistrar } from './auth';

describe('validations/auth', () => {
  it('rejeita e-mail inválido no login', () => {
    const resultado = schemaEntrar.safeParse({
      email: 'invalido',
      senha: 'senha123',
    });
    expect(resultado.success).toBe(false);
  });

  it('aceita registro válido', () => {
    const resultado = schemaRegistrar.safeParse({
      nome: 'Demo',
      email: 'demo@copix.local',
      senha: 'senha123',
    });
    expect(resultado.success).toBe(true);
  });
});
