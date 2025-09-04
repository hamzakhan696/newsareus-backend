import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid, BidStatus } from '../entities/bid.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { BidResponseDto } from './dto/bid-response.dto';
import { Company } from '../entities/company.entity';
import { Upload } from '../entities/upload.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BiddingService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    private uploadService: UploadService,
  ) {}

  /**
   * Create a new bid
   */
  async createBid(createBidDto: CreateBidDto, companyId: number): Promise<BidResponseDto> {
    // Check if upload exists and is available for bidding
    const upload = await this.uploadRepository.findOne({
      where: { id: createBidDto.uploadId, isAvailableForBidding: true }
    });

    if (!upload) {
      throw new NotFoundException('Upload not found or not available for bidding');
    }

    // Check if company has already bid on this upload
    const existingBid = await this.bidRepository.findOne({
      where: { companyId, uploadId: createBidDto.uploadId }
    });

    if (existingBid) {
      throw new ForbiddenException('Company has already bid on this upload');
    }

    // Create new bid
    const bid = this.bidRepository.create({
      ...createBidDto,
      companyId,
      status: BidStatus.PENDING
    });

    const savedBid = await this.bidRepository.save(bid);

    // Update upload status to indicate bid received
    await this.uploadService.updateUploadStatusOnBid(createBidDto.uploadId);

    // Return bid with relations
    return this.getBidWithRelations(savedBid.id);
  }

  /**
   * Get all bids for a company
   */
  async getCompanyBids(companyId: number): Promise<BidResponseDto[]> {
    const bids = await this.bidRepository.find({
      where: { companyId },
      relations: ['company', 'upload'],
      order: { createdAt: 'DESC' }
    });

    return bids.map(bid => this.mapBidToResponse(bid));
  }

  /**
   * Get all bids for a specific upload (for user to review)
   */
  async getUploadBids(uploadId: number, userId: number): Promise<BidResponseDto[]> {
    // Verify user owns this upload
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId, userId }
    });

    if (!upload) {
      throw new NotFoundException('Upload not found or access denied');
    }

    const bids = await this.bidRepository.find({
      where: { uploadId },
      relations: ['company', 'upload'],
      order: { createdAt: 'DESC' }
    });

    return bids.map(bid => this.mapBidToResponse(bid));
  }

  /**
   * Update bid status (accept/decline by user)
   */
  async updateBidStatus(bidId: number, updateBidStatusDto: UpdateBidStatusDto, userId: number): Promise<BidResponseDto> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['upload']
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Verify user owns the upload
    if (bid.upload.userId !== userId) {
      throw new ForbiddenException('Access denied to this bid');
    }

    // Update bid status
    bid.status = updateBidStatusDto.status;
    await this.bidRepository.save(bid);

    // Update upload status based on bid action
    await this.uploadService.updateUploadStatusOnBidAction(bid.uploadId, updateBidStatusDto.status);

    // If bid is accepted, hide the upload from other companies
    if (updateBidStatusDto.status === BidStatus.ACCEPTED) {
      await this.uploadRepository.update(bid.uploadId, { isAvailableForBidding: false });
    }

    return this.getBidWithRelations(bidId);
  }

  /**
   * Get bid with relations
   */
  private async getBidWithRelations(bidId: number): Promise<BidResponseDto> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['company', 'upload']
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return this.mapBidToResponse(bid);
  }

  /**
   * Map bid entity to response DTO
   */
  private mapBidToResponse(bid: Bid): BidResponseDto {
    return {
      id: bid.id,
      amount: bid.amount,
      message: bid.message,
      bidType: bid.bidType,
      status: bid.status,
      company: {
        id: bid.company.id,
        name: bid.company.companyName,
        email: bid.company.companyEmail,
      },
      upload: {
        id: bid.upload.id,
        title: bid.upload.title,
        description: bid.upload.description,
        filename: bid.upload.filename,
        fileType: bid.upload.fileType,
        previewUrl: bid.upload.watermarkedPreviewUrl,
      },
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
    };
  }
}
