import { ApiProperty } from '@nestjs/swagger';

export class TipStatusSummary {
  @ApiProperty({
    description: 'Number of tips with this status',
    example: 42,
  })
  count: number;

  @ApiProperty({
    description: 'Total amount in KWD for this status',
    example: 156.5,
  })
  totalAmount: number;
}

export class MerchantTipSummaryDto {
  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  merchantId: string;

  @ApiProperty({
    description: 'Pending tips summary',
    type: TipStatusSummary,
  })
  pending: TipStatusSummary;

  @ApiProperty({
    description: 'Confirmed tips summary',
    type: TipStatusSummary,
  })
  confirmed: TipStatusSummary;

  @ApiProperty({
    description: 'Reversed tips summary',
    type: TipStatusSummary,
  })
  reversed: TipStatusSummary;

  @ApiProperty({
    description: 'Net total amount (confirmed - reversed)',
    example: 152.0,
  })
  netTotal: number;
}
