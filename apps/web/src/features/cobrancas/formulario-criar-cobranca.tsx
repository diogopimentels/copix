'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCriarCobranca } from '@/hooks/use-cobrancas';
import {
  schemaCriarCobranca,
  type DadosCriarCobranca,
} from '@/lib/validations/cobranca';
import { parsearValorBRL } from '@/lib/utils/formatadores';

type Props = {
  organizacaoId: string;
  onCriado?: () => void;
};

export function FormularioCriarCobranca({ organizacaoId, onCriado }: Props) {
  const criar = useCriarCobranca(organizacaoId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DadosCriarCobranca>({
    resolver: zodResolver(schemaCriarCobranca),
    defaultValues: {
      descricao: '',
      valor: '',
      vencimentoEm: '',
    },
  });

  async function onSubmit(dados: DadosCriarCobranca) {
    try {
      await criar.mutateAsync({
        descricao: dados.descricao,
        valorCentavos: parsearValorBRL(dados.valor),
        vencimentoEm: dados.vencimentoEm || undefined,
      });
      toast.success('Cobrança criada');
      reset({ descricao: '', valor: '', vencimentoEm: '' });
      onCriado?.();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao criar cobrança');
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 md:grid-cols-2"
      noValidate
    >
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input id="descricao" {...register('descricao')} />
        {errors.descricao ? (
          <p className="text-sm text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="valor">Valor (BRL)</Label>
        <Input id="valor" placeholder="29,90" {...register('valor')} />
        {errors.valor ? (
          <p className="text-sm text-destructive">{errors.valor.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="vencimentoEm">Vencimento (opcional)</Label>
        <Input id="vencimentoEm" type="datetime-local" {...register('vencimentoEm')} />
      </div>

      <div className="md:col-span-2">
        <Button type="submit" disabled={criar.isPending}>
          {criar.isPending ? 'Criando...' : 'Criar cobrança'}
        </Button>
      </div>
    </form>
  );
}
