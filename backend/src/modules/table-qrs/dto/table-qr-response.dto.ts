import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TableQRResponseDto {
  @ApiProperty({
    description: 'TableQR UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Table code/number',
    example: 'T1',
  })
  tableCode: string;

  @ApiProperty({
    description: 'Table location description',
    example: 'Main dining area',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Whether table QR is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Associated merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  merchantId: string;

  @ApiProperty({
    description: 'TableQR creation date',
    example: '2025-12-28T10:00:00Z',
  })
  createdAt: Date;
}

export class TableQRListResponseDto {
  @ApiProperty({
    description: 'List of table QRs',
    type: [TableQRResponseDto],
  })
  tableQRs: TableQRResponseDto[];

  @ApiProperty({
    description: 'Total number of table QRs',
    example: 10,
  })
  total: number;
}

export class ParamTableQRDto {
  @ApiProperty({
    description: 'TableQR UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
}
