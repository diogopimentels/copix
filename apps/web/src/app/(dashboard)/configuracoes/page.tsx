'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { EstadoErro } from '@/components/shared/estado-erro';
import { EstadoVazio } from '@/components/shared/estado-vazio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePerfil } from '@/hooks/use-auth';
import { useOrganizacaoAtiva } from '@/hooks/use-organizacao-ativa';
import {
  useCriarOrganizacao,
  useCriarProvedor,
  useOrganizacaoDetalhe,
} from '@/hooks/use-provedores';
import {
  schemaCriarOrganizacao,
  type DadosCriarOrganizacao,
} from '@/lib/validations/organizacao';
import { formatarDocumento } from '@/lib/utils/formatadores';
import { useOrganizacaoStore } from '@/stores/organizacao-store';

export default function PaginaConfiguracoes() {
  const { data: perfil } = usePerfil();
  const { organizacaoId } = useOrganizacaoAtiva();
  const detalhe = useOrganizacaoDetalhe(organizacaoId);
  const criarOrg = useCriarOrganizacao();
  const criarProvedor = useCriarProvedor(organizacaoId);
  const definirOrganizacaoId = useOrganizacaoStore((s) => s.definirOrganizacaoId);

  const formOrg = useForm<DadosCriarOrganizacao>({
    resolver: zodResolver(schemaCriarOrganizacao),
    defaultValues: { nome: '', documento: '' },
  });

  async function onCriarOrg(dados: DadosCriarOrganizacao) {
    try {
      const org = await criarOrg.mutateAsync(dados);
      definirOrganizacaoId(org.id);
      formOrg.reset();
      toast.success('Organização criada');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao criar organização');
    }
  }

  async function onCriarProvedor() {
    if (!organizacaoId) return;
    try {
      await criarProvedor.mutateAsync('Simulador adicional');
      toast.success('Provedor criado');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao criar provedor');
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        titulo="Configurações"
        descricao="Organização, provedores Pix (simulador) e conta. Sem features inventadas."
      />

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <span className="text-muted-foreground">Nome:</span> {perfil?.nome}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">E-mail:</span> {perfil?.email}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nova organização</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={formOrg.handleSubmit(onCriarOrg)}
            className="grid gap-3 md:grid-cols-2"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="nome-org">Nome</Label>
              <Input id="nome-org" {...formOrg.register('nome')} />
              {formOrg.formState.errors.nome ? (
                <p className="text-sm text-destructive">
                  {formOrg.formState.errors.nome.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documento-org">CNPJ (14 dígitos)</Label>
              <Input id="documento-org" {...formOrg.register('documento')} />
              {formOrg.formState.errors.documento ? (
                <p className="text-sm text-destructive">
                  {formOrg.formState.errors.documento.message}
                </p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={criarOrg.isPending}>
                {criarOrg.isPending ? 'Criando...' : 'Criar organização'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!organizacaoId ? (
        <EstadoVazio
          titulo="Nenhuma organização ativa"
          descricao="Crie uma organização acima para ver provedores e membros."
        />
      ) : detalhe.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : detalhe.isError ? (
        <EstadoErro
          mensagem={
            detalhe.error instanceof Error
              ? detalhe.error.message
              : 'Erro ao carregar organização'
          }
          onTentarNovamente={() => void detalhe.refetch()}
        />
      ) : detalhe.data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Organização ativa</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Nome:</span>{' '}
                {detalhe.data.nome}
              </p>
              <p>
                <span className="text-muted-foreground">CNPJ:</span>{' '}
                {formatarDocumento(detalhe.data.documento)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle>Provedores Pix</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onCriarProvedor()}
                disabled={criarProvedor.isPending}
              >
                Novo simulador
              </Button>
            </CardHeader>
            <CardContent>
              {(detalhe.data.provedores ?? []).length === 0 ? (
                <EstadoVazio titulo="Sem provedores" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Chave webhook</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detalhe.data.provedores ?? []).map((provedor) => (
                      <TableRow key={provedor.id}>
                        <TableCell>{provedor.nome}</TableCell>
                        <TableCell>{provedor.tipo}</TableCell>
                        <TableCell>{provedor.ativo ? 'sim' : 'não'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {provedor.chaveWebhook}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Endpoint público: POST /webhooks/pix/:provedorId com header
                x-copix-signature.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membros</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(detalhe.data.membros ?? []).map((membro) => (
                    <TableRow key={membro.id}>
                      <TableCell>{membro.usuario.nome}</TableCell>
                      <TableCell>{membro.usuario.email}</TableCell>
                      <TableCell>{membro.papel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                Convite de membros ainda não existe na API — lista só leitura.
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
