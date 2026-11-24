import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class SimularPagamentoDto {
  @IsString()
  @MinLength(8)
  cobrancaId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  valorCentavos?: number;
}
