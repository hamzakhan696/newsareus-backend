import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BidStatus } from '../../entities/bid.entity';

export class UpdateBidStatusDto {
  @ApiProperty({
    description: 'New bid status',
    enum: BidStatus,
    example: BidStatus.ACCEPTED,
  })
  @IsEnum(BidStatus)
  status: BidStatus;
}
