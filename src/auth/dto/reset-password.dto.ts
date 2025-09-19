import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: ['user', 'company'], example: 'user' })
  @IsIn(['user', 'company'])
  type: 'user' | 'company';

  @ApiProperty({ description: 'Password reset token from email link' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}



