import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@newsareus.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'admin123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Admin login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Login response data',
    example: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      admin: {
        email: 'admin@newsareus.com',
        role: 'admin',
      },
    },
  })
  data: {
    token: string;
    admin: {
      email: string;
      role: string;
    };
  };
}

export class AdminProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Admin profile retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Admin profile data',
    example: {
      email: 'admin@newsareus.com',
      role: 'admin',
    },
  })
  data: {
    email: string;
    role: string;
  };
}
