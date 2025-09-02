import { ApiProperty } from '@nestjs/swagger';

class CompanyInfoDto {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Company name',
    example: 'ABC News Network',
  })
  companyName: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@abcnews.com',
  })
  companyEmail: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+12345678901',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Media Street, New York, NY 10001',
  })
  companyAddress: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://www.abcnews.com',
  })
  companyWebsite: string;

  @ApiProperty({
    description: 'Business license',
    example: 'BL-2024-001234',
  })
  businessLicense: string;

  @ApiProperty({
    description: 'Company type (free text provided by user)',
    example: 'press',
  })
  companyType: string;

  @ApiProperty({
    description: 'Verification status',
    example: false,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Account status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class CompanyAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Company information',
    type: CompanyInfoDto,
  })
  company: CompanyInfoDto;
}
