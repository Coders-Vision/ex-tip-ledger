import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipIntentStatus } from 'src/common/database/type-orm/entities/tip-intent.entity';
import { IsUUID } from 'class-validator';

export class TipIntentResponseDto {
  @ApiProperty({
    description: 'Tip intent ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  merchantId: string;

  @ApiPropertyOptional({
    description: 'Table QR ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tableQRId?: string;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  employeeId?: string;

  @ApiProperty({
    description: 'Tip amount in KWD',
    example: 1.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Tip intent status',
    enum: TipIntentStatus,
    example: TipIntentStatus.PENDING,
  })
  status: TipIntentStatus;

  @ApiProperty({
    description: 'Table code',
    example: 'T1',
  })
  tableCode: string;

  @ApiPropertyOptional({
    description: 'Employee hint',
    example: 'Ahmed',
  })
  employeeHint?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-26T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Confirmation timestamp',
    example: '2025-12-26T10:05:00.000Z',
  })
  confirmedAt?: Date;

  @ApiPropertyOptional({
    description: 'Reversal timestamp',
    example: '2025-12-26T10:10:00.000Z',
  })
  reversedAt?: Date;
}


export class ParamTipIntentDto {
  @ApiProperty({
    description: 'Tip Intent UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
}