import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranslationOptional {
  @IsOptional()
  @IsString()
  en: string; // English

  @IsOptional()
  @IsString()
  ar: string; // Arabic
}
