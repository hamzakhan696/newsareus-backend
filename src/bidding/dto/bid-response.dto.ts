import { ApiProperty } from '@nestjs/swagger';
import { BidStatus } from '../../entities/bid.entity';

export class BidResponseDto {
  @ApiProperty({
    description: 'Bid ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Upload ID',
    example: 1,
  })
  uploadId: number;

  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'Company name',
    example: 'ABC News Network',
  })
  companyName: string;

  @ApiProperty({
    description: 'Bid amount',
    example: 150.00,
  })
  bidAmount: number;

  @ApiProperty({
    description: 'Bid message',
    example: 'We are interested in using this content.',
  })
  message: string;

  @ApiProperty({
    description: 'Bid status',
    enum: BidStatus,
    example: BidStatus.PENDING,
  })
  status: BidStatus;

  @ApiProperty({
    description: 'Bid expiration date',
    example: '2025-02-01T10:15:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Payment status',
    example: false,
  })
  isPaid: boolean;

  @ApiProperty({
    description: 'Bid creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class BidsListResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Bids retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of bids',
    type: [BidResponseDto],
  })
  data: BidResponseDto[];
}
