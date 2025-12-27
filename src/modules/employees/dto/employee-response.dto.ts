import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Employee name',
    example: 'Jane Smith',
  })
  name: string;

  @ApiProperty({
    description: 'Employee email',
    example: 'jane@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Employee phone number',
    example: '+965 1234 5678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Whether employee is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Associated merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  merchantId: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Employee creation date',
    example: '2025-12-28T10:00:00Z',
  })
  createdAt: Date;
}

export class EmployeeListResponseDto {
  @ApiProperty({
    description: 'List of employees',
    type: [EmployeeResponseDto],
  })
  employees: EmployeeResponseDto[];

  @ApiProperty({
    description: 'Total number of employees',
    example: 10,
  })
  total: number;
}
