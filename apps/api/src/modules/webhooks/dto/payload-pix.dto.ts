import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class PayloadPixDto {
  @IsString()
  @MinLength(8)
  endToEndId!: string;

  @IsOptional()
  @IsString()
  txid?: string;

  @IsInt()
  @Min(1)
  valorCentavos!: number;

  @IsOptional()
  @IsString()
  horario?: string;
}
