import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/database/type-orm/entities';

export class UserResponseDto {
  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+965 1234 5678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.MERCHANT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'User creation date',
    example: '2025-12-28T10:00:00Z',
  })
  createdAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 10,
  })
  total: number;
}
