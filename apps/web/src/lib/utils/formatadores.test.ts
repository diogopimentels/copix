import { describe, expect, it } from 'vitest';
import {
  formatarDocumento,
  formatarMoeda,
  parsearValorBRL,
} from './formatadores';

describe('formatadores', () => {
  it('formata centavos em BRL', () => {
    const texto = formatarMoeda(15990).replace(/\s/g, ' ');
    expect(texto).toContain('159,90');
    expect(texto).toContain('R$');
  });

  it('converte texto BRL em centavos', () => {
    expect(parsearValorBRL('29,90')).toBe(2990);
    expect(parsearValorBRL('1.299,90')).toBe(129990);
  });

  it('formata CNPJ', () => {
    expect(formatarDocumento('12345678000199')).toBe('12.345.678/0001-99');
  });
});
