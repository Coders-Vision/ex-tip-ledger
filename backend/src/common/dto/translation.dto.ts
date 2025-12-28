import { IsNotEmpty, IsString } from 'class-validator';

export class Translation {
  @IsNotEmpty()
  @IsString()
  en: string; // English

  @IsNotEmpty()
  @IsString()
  ar: string; // Arabic
}
