import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({
    description: 'Bid amount in USD',
    example: 150.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Optional message from company',
    example: 'We are interested in using this content for our news segment.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({
    description: 'Bid type (string from frontend)',
    example: 'news_coverage',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bidType?: string;

  @ApiProperty({
    description: 'Upload ID that this bid is for',
    example: 1,
  })
  @IsNumber()
  uploadId: number;
}
