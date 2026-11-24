'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={alternarMenu}
        aria-label="Abrir menu"
        aria-controls="menu-principal"
      >
        <Menu className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <label htmlFor="seletor-org" className="sr-only">
          Organização ativa
        </label>
        <NativeSelect
          id="seletor-org"
          className="max-w-full md:max-w-xs"
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
        </NativeSelect>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">
            {perfil?.nome ?? '…'}
          </p>
          <p className="text-xs text-muted-foreground">{perfil?.email}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={sair}>
          Sair
        </Button>
      </div>
    </header>
  );
}
