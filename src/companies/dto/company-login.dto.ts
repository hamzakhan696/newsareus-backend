import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CompanyLoginDto {
  @ApiProperty({
    description: 'Company email address',
    example: 'contact@abcnews.com',
  })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'FCM token for push notifications',
    example: 'fcm_token_here',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
