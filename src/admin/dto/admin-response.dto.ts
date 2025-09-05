import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
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
    description: 'User email',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+12345678901',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class CompanyDto {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Company name',
    example: 'ABC Media Company',
  })
  companyName: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@abcmedia.com',
  })
  companyEmail: string;

  @ApiProperty({
    description: 'Company creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total number of records',
    example: 50,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

export class UsersListResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Users retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of users',
    type: [UserDto],
  })
  data: UserDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}

export class CompaniesListResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Companies retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of companies',
    type: [CompanyDto],
  })
  data: CompanyDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
