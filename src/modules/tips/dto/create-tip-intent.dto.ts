import { IsString, IsNumber, IsUUID, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTipIntentDto {
  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  merchantId: string;

  @ApiProperty({
    description: 'Table code where tip originates',
    example: 'T1',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  tableCode: string;

  @ApiProperty({
    description: 'Tip amount in KWD (supports up to 3 decimal places)',
    example: 1.5,
    minimum: 0.001,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  amount: number;

  @ApiProperty({
    description: 'Idempotency key to prevent duplicate tip creation',
    example: 'abc-123-xyz',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: 'Optional hint about which employee should receive the tip',
    example: 'Ahmed',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  employeeHint?: string;
}
