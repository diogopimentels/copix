import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegredoMascarado } from './segredo-mascarado';

describe('SegredoMascarado', () => {
  it('mascara o valor por padrão e revela ao clicar', async () => {
    const user = userEvent.setup();
    render(<SegredoMascarado valor="abcdefghijklmnop" />);

    expect(screen.getByText(/abcd••••••••mnop/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mostrar/i }));
    expect(screen.getByText('abcdefghijklmnop')).toBeInTheDocument();
  });

  it('copia o valor para a área de transferência', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<SegredoMascarado valor="segredo-teste" rotulo="Chave" />);
    await user.click(screen.getByRole('button', { name: /copiar chave/i }));
    expect(writeText).toHaveBeenCalledWith('segredo-teste');
  });

});
