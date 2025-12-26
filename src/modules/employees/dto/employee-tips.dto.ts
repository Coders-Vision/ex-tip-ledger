import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { LedgerEntryType } from 'src/common/database/type-orm/entities/ledger-entry.entity';

export class LedgerEntryDto {
  @ApiProperty({
    description: 'Ledger entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tip intent ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tipIntentId: string;

  @ApiProperty({
    description: 'Amount in KWD (positive for CREDIT, negative for DEBIT)',
    example: 5.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Ledger entry type',
    enum: LedgerEntryType,
    example: LedgerEntryType.CREDIT,
  })
  type: LedgerEntryType;

  @ApiProperty({
    description: 'Entry creation timestamp',
    example: '2025-12-26T10:05:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Optional notes',
    example: 'Tip from table T1',
    required: false,
  })
  notes?: string;
}

export class EmployeeTipsDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  employeeId: string;

  @ApiProperty({
    description: 'List of ledger entries',
    type: [LedgerEntryDto],
  })
  entries: LedgerEntryDto[];

  @ApiProperty({
    description: 'Total amount earned (sum of all ledger entries)',
    example: 234.75,
  })
  totalAmount: number;
}

export class ParamEmployeeDto {
  @ApiProperty({
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
}
