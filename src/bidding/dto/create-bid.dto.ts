import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsPositive, MinLength } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({
    description: 'Upload ID to bid on',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  uploadId: number;

  @ApiProperty({
    description: 'Bid amount in USD',
    example: 150.00,
  })
  @IsNumber()
  @IsPositive()
  bidAmount: number;

  @ApiProperty({
    description: 'Optional message from company',
    example: 'We are interested in using this content for our news segment.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  message?: string;
}
