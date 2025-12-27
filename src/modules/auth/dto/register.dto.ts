import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/common/database/type-orm/entities';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+96512345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.MERCHANT, default: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // For merchants - business name
  @ApiPropertyOptional({ example: 'Best Restaurant', description: 'Required when role is merchant' })
  @ValidateIf((o) => o.role === UserRole.MERCHANT)
  @IsString()
  @IsNotEmpty({ message: 'businessName is required for merchant registration' })
  businessName?: string;

  // For employees - which merchant they belong to
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Required when role is employee',
  })
  @ValidateIf((o) => o.role === UserRole.EMPLOYEE || !o.role)
  @IsUUID('4', { message: 'merchantId must be a valid UUID' })
  @IsNotEmpty({ message: 'merchantId is required for employee registration' })
  merchantId?: string;
}
