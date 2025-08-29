import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+12345678901',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Account creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'User registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', example: 'john@example.com' },
      phoneNumber: { type: 'string', example: '+12345678901' },
      createdAt: { type: 'string', example: '2025-01-27T10:15:00.000Z' },
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  data: UserResponseDto & { token: string };
}
