import { Controller, Post, Get, Put, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BiddingService } from './bidding.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { BidResponseDto } from './dto/bid-response.dto';

@ApiTags('Bidding')
@Controller('bidding')
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bid' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 201, description: 'Bid created successfully', type: BidResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Company has already bid on this upload' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async createBid(
    @Body() createBidDto: CreateBidDto,
    @Query('companyId', ParseIntPipe) companyId: number
  ): Promise<BidResponseDto> {
    return this.biddingService.createBid(createBidDto, companyId);
  }

  @Get('company/my-bids')
  @ApiOperation({ summary: 'Get all bids for the specified company' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company bids retrieved successfully', type: [BidResponseDto] })
  async getCompanyBids(@Query('companyId', ParseIntPipe) companyId: number): Promise<BidResponseDto[]> {
    return this.biddingService.getCompanyBids(companyId);
  }

  @Get('upload/:uploadId/bids')
  @ApiOperation({ summary: 'Get all bids for a specific upload (for upload owner)' })
  @ApiParam({ name: 'uploadId', description: 'Upload ID' })
  @ApiQuery({ name: 'userId', required: true, type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Upload bids retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found or access denied' })
  async getUploadBids(
    @Param('uploadId', ParseIntPipe) uploadId: number,
    @Query('userId', ParseIntPipe) userId: number
  ): Promise<BidResponseDto[]> {
    return this.biddingService.getUploadBids(uploadId, userId);
  }

  @Put(':bidId/status')
  @ApiOperation({ summary: 'Update bid status (accept/decline by upload owner)' })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  @ApiQuery({ name: 'userId', required: true, type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Bid status updated successfully', type: BidResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied to this bid' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async updateBidStatus(
    @Param('bidId', ParseIntPipe) bidId: number,
    @Body() updateBidStatusDto: UpdateBidStatusDto,
    @Query('userId', ParseIntPipe) userId: number
  ): Promise<BidResponseDto> {
    return this.biddingService.updateBidStatus(bidId, updateBidStatusDto, userId);
  }
}
