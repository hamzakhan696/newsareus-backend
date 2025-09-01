import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BiddingService } from './bidding.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { BidResponseDto, BidsListResponseDto } from './dto/bid-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bidding')
@Controller('bidding')
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Post('bid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new bid (Company only)' })
  @ApiResponse({
    status: 201,
    description: 'Bid created successfully',
    type: BidResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data or already has pending bid',
  })
  @ApiResponse({
    status: 404,
    description: 'Upload or company not found',
  })
  async createBid(@Body() createBidDto: CreateBidDto, @Request() req) {
    // Assuming JWT contains company information
    const companyId = req.user.sub; // This should be company ID for company users
    return this.biddingService.createBid(createBidDto, companyId);
  }

  @Get('uploads/available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available uploads for bidding (Company only)' })
  @ApiResponse({
    status: 200,
    description: 'Available uploads retrieved successfully',
  })
  async getAvailableUploads(@Request() req) {
    return this.biddingService.getAvailableUploadsForBidding();
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bids made by company (Company only)' })
  @ApiResponse({
    status: 200,
    description: 'Company bids retrieved successfully',
    type: BidsListResponseDto,
  })
  async getMyBids(@Request() req) {
    const companyId = req.user.sub;
    return this.biddingService.getBidsByCompany(companyId);
  }

  @Get('upload/:uploadId/bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bids for a specific upload (Upload owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Upload bids retrieved successfully',
    type: BidsListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found or no permission',
  })
  async getBidsForUpload(
    @Param('uploadId', ParseIntPipe) uploadId: number,
    @Request() req
  ) {
    const userId = req.user.sub;
    return this.biddingService.getBidsForUpload(uploadId, userId);
  }

  @Put('bid/:bidId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bid status - accept/reject (Upload owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Bid status updated successfully',
    type: BidResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - bid cannot be updated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no permission to update bid',
  })
  @ApiResponse({
    status: 404,
    description: 'Bid not found',
  })
  async updateBidStatus(
    @Param('bidId', ParseIntPipe) bidId: number,
    @Body() updateBidStatusDto: UpdateBidStatusDto,
    @Request() req
  ) {
    const userId = req.user.sub;
    return this.biddingService.updateBidStatus(bidId, updateBidStatusDto, userId);
  }
}
