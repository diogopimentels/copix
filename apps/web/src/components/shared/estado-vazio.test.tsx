import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EstadoVazio } from './estado-vazio';

describe('EstadoVazio', () => {
  it('mostra título e descrição', () => {
    render(
      <EstadoVazio
        titulo="Sem dados"
        descricao="Crie o primeiro registro"
      />,
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Crie o primeiro registro')).toBeInTheDocument();
  });
});
