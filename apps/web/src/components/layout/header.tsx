'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePerfil, useSair } from '@/hooks/use-auth';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import { useUiStore } from '@/stores/ui-store';

export function Header() {
  const alternarMenu = useUiStore((s) => s.alternarMenu);
  const { data: perfil } = usePerfil();
  const sair = useSair();
  const {
    organizacaoId,
    organizacoes,
    definirOrganizacaoId,
    isLoading,
  } = useOrganizacaoAtiva();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={alternarMenu}
        aria-label="Abrir menu"
      >
        <Menu className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <label htmlFor="seletor-org" className="sr-only">
          Organização ativa
        </label>
        <select
          id="seletor-org"
          className="h-10 max-w-full rounded-md border border-input bg-card px-3 text-sm md:max-w-xs"
          value={organizacaoId ?? ''}
          disabled={isLoading || organizacoes.length === 0}
          onChange={(e) => definirOrganizacaoId(e.target.value)}
        >
          {organizacoes.length === 0 ? (
            <option value="">Nenhuma organização</option>
          ) : null}
          {organizacoes.map((org) => (
            <option key={org.id} value={org.id}>
              {org.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <p className="hidden text-sm text-muted-foreground sm:block">
          {perfil?.nome ?? '…'}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={sair}>
          Sair
        </Button>
      </div>
    </header>
  );
}
