import { ApiProperty } from '@nestjs/swagger';
import { BidStatus } from '../../entities/bid.entity';

export class CompanyInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'News Corp' })
  name: string;

  @ApiProperty({ example: 'news@corp.com' })
  email: string;
}

export class UploadInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Breaking News Video' })
  title: string;

  @ApiProperty({ example: 'Important news coverage' })
  description: string;

  @ApiProperty({ example: 'video.mp4' })
  filename: string;

  @ApiProperty({ example: 'video' })
  fileType: string;

  @ApiProperty({ 
    example: 'https://res.cloudinary.com/demo/video/upload/eo_30,so_0/a_-45,co_white,g_center,l_text:Arial_450_bold:NEWSAREUS,o_60,x_0,y_0/q_auto/v12345/watermarked_preview.mp4',
    description: 'Watermarked preview URL for companies to see'
  })
  previewUrl: string;
}

export class BidResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 150.00 })
  amount: number;

  @ApiProperty({ example: 'We are interested in using this content.' })
  message: string;

  @ApiProperty({ example: 'news_coverage' })
  bidType: string;

  @ApiProperty({ enum: BidStatus, example: BidStatus.PENDING })
  status: BidStatus;

  @ApiProperty({ type: CompanyInfoDto })
  company: CompanyInfoDto;

  @ApiProperty({ type: UploadInfoDto })
  upload: UploadInfoDto;

  @ApiProperty({ example: '2025-01-27T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-27T10:15:00.000Z' })
  updatedAt: Date;
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
