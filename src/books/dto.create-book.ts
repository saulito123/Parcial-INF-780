import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  autor!: string;

  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @IsInt()
  @Min(1800)
  @Max(2100)
  anioPublicacion!: number;

  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @IsInt()
  @Min(0)
  stock!: number;
}
