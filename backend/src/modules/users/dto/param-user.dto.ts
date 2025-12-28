import { IsMongoId } from 'class-validator';

export class ParamUserDto {
  @IsMongoId()
  readonly id: string;
}
