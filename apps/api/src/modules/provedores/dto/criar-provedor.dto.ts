import { IsString, MinLength } from 'class-validator';

export class CriarProvedorDto {
  @IsString()
  @MinLength(2)
  nome!: string;
}
