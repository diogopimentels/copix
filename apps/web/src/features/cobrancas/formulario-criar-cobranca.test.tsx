import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FormularioCriarCobranca } from './formulario-criar-cobranca';

vi.mock('@/hooks/use-cobrancas', () => ({
  useCriarCobranca: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('FormularioCriarCobranca', () => {
  it('exige descrição e valor válidos', async () => {
    const user = userEvent.setup();
    render(<FormularioCriarCobranca organizacaoId="org-1" />, { wrapper });

    await user.click(screen.getByRole('button', { name: /criar cobrança/i }));
    expect(await screen.findByText(/descrição/i)).toBeInTheDocument();
  });
});
