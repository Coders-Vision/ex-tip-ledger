import { ApiProperty } from '@nestjs/swagger';

export class MerchantResponseDto {
  @ApiProperty({
    description: 'Merchant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Merchant/Business name',
    example: 'The Great Restaurant',
  })
  name: string;

  @ApiProperty({
    description: 'Merchant email',
    example: 'restaurant@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Merchant phone number',
    example: '+965 1234 5678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Whether merchant is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Associated user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Merchant creation date',
    example: '2025-12-28T10:00:00Z',
  })
  createdAt: Date;
}

export class MerchantListResponseDto {
  @ApiProperty({
    description: 'List of merchants',
    type: [MerchantResponseDto],
  })
  merchants: MerchantResponseDto[];

  @ApiProperty({
    description: 'Total number of merchants',
    example: 10,
  })
  total: number;
}
