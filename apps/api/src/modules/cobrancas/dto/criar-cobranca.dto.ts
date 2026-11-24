import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CriarCobrancaDto {
  @IsInt()
  @Min(1)
  valorCentavos!: number;

  @IsString()
  @MinLength(3)
  descricao!: string;

  @IsOptional()
  @IsDateString()
  vencimentoEm?: string;
}
