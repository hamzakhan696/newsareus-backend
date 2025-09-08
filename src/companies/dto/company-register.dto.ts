import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, Matches, IsOptional, IsUrl } from 'class-validator';

export class CompanyRegisterDto {
  @ApiProperty({
    description: 'Company name',
    example: 'ABC News Network',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@abcnews.com',
  })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Confirm password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please enter a valid phone number' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Media Street, New York, NY 10001',
  })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({
    description: 'Company website (optional)',
    example: 'https://www.abcnews.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please enter a valid website URL' })
  companyWebsite?: string;

  @ApiProperty({
    description: 'Business license number',
    example: 'BL-2024-001234',
  })
  @IsString()
  @IsNotEmpty()
  businessLicense: string;

  @ApiProperty({
    description: 'Company type (free text provided by user)',
    example: 'press',
  })
  @IsString()
  @IsNotEmpty()
  companyType: string;

  @ApiProperty({
    description: 'FCM token for push notifications',
    example: 'fcm_token_here',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
