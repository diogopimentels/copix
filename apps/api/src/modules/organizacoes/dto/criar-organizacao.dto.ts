import { IsString, Matches, MinLength } from 'class-validator';

export class CriarOrganizacaoDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  // CNPJ só com dígitos
  @IsString()
  @Matches(/^\d{14}$/, { message: 'documento precisa ser um CNPJ com 14 dígitos' })
  documento!: string;
}
