export function formatarMoeda(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(valor: string | Date) {
  return new Date(valor).toLocaleString('pt-BR');
}

export function formatarDataCurta(valor: string | Date) {
  return new Date(valor).toLocaleDateString('pt-BR');
}

export function formatarDocumento(documento: string) {
  const digitos = documento.replace(/\D/g, '');
  if (digitos.length !== 14) return documento;
  return digitos.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}

/** Converte texto tipo "29,90" ou "1.299,90" em centavos. */
export function parsearValorBRL(valor: string): number {
  const limpo = valor.trim().replace(/\./g, '').replace(',', '.');
  const numero = Number(limpo);
  if (Number.isNaN(numero)) {
    throw new Error('Valor inválido');
  }
  return Math.round(numero * 100);
}
