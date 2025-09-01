import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid, BidStatus } from '../entities/bid.entity';
import { Upload } from '../entities/upload.entity';
import { Company } from '../entities/company.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { BidResponseDto, BidsListResponseDto } from './dto/bid-response.dto';

@Injectable()
export class BiddingService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  /**
   * Create a new bid by a company
   */
  async createBid(createBidDto: CreateBidDto, companyId: number): Promise<BidResponseDto> {
    const { uploadId, bidAmount, message } = createBidDto;

    // Check if upload exists and is available for bidding
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
      relations: ['user'],
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    if (!upload.isAvailableForBidding) {
      throw new BadRequestException('This upload is not available for bidding');
    }

    // Check if company exists
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if company already has a pending bid for this upload
    const existingBid = await this.bidRepository.findOne({
      where: {
        uploadId,
        companyId,
        status: BidStatus.PENDING,
      },
    });

    if (existingBid) {
      throw new BadRequestException('You already have a pending bid for this upload');
    }

    // Create new bid (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const bid = this.bidRepository.create({
      uploadId,
      companyId,
      bidAmount,
      message,
      expiresAt,
      status: BidStatus.PENDING,
    });

    const savedBid = await this.bidRepository.save(bid);

    // Return bid with company name
    return {
      id: savedBid.id,
      uploadId: savedBid.uploadId,
      companyId: savedBid.companyId,
      companyName: company.companyName,
      bidAmount: savedBid.bidAmount,
      message: savedBid.message,
      status: savedBid.status,
      expiresAt: savedBid.expiresAt,
      isPaid: savedBid.isPaid,
      createdAt: savedBid.createdAt,
    };
  }

  /**
   * Get all bids for a specific upload (for the upload owner)
   */
  async getBidsForUpload(uploadId: number, userId: number): Promise<BidsListResponseDto> {
    // Verify upload ownership
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId, userId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found or you do not have permission to view bids');
    }

    // Get all bids for this upload
    const bids = await this.bidRepository.find({
      where: { uploadId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });

    const bidResponses: BidResponseDto[] = bids.map(bid => ({
      id: bid.id,
      uploadId: bid.uploadId,
      companyId: bid.companyId,
      companyName: bid.company.companyName,
      bidAmount: bid.bidAmount,
      message: bid.message,
      status: bid.status,
      expiresAt: bid.expiresAt,
      isPaid: bid.isPaid,
      createdAt: bid.createdAt,
    }));

    return {
      success: true,
      message: 'Bids retrieved successfully',
      data: bidResponses,
    };
  }

  /**
   * Get all bids made by a company
   */
  async getBidsByCompany(companyId: number): Promise<BidsListResponseDto> {
    const bids = await this.bidRepository.find({
      where: { companyId },
      relations: ['upload', 'upload.user'],
      order: { createdAt: 'DESC' },
    });

    const bidResponses: BidResponseDto[] = bids.map(bid => ({
      id: bid.id,
      uploadId: bid.uploadId,
      companyId: bid.companyId,
      companyName: '', // Will be filled from company relation
      bidAmount: bid.bidAmount,
      message: bid.message,
      status: bid.status,
      expiresAt: bid.expiresAt,
      isPaid: bid.isPaid,
      createdAt: bid.createdAt,
    }));

    return {
      success: true,
      message: 'Company bids retrieved successfully',
      data: bidResponses,
    };
  }

  /**
   * Update bid status (accept/reject by upload owner)
   */
  async updateBidStatus(bidId: number, updateDto: UpdateBidStatusDto, userId: number): Promise<BidResponseDto> {
    const { status } = updateDto;

    // Get bid with upload and company relations
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['upload', 'company'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Verify upload ownership
    if (bid.upload.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this bid');
    }

    // Check if bid is still pending
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Bid status cannot be changed');
    }

    // Check if bid has expired
    if (new Date() > bid.expiresAt) {
      bid.status = BidStatus.EXPIRED;
      await this.bidRepository.save(bid);
      throw new BadRequestException('Bid has expired');
    }

    // Update bid status
    bid.status = status;
    const updatedBid = await this.bidRepository.save(bid);

    // If bid is accepted, mark upload as no longer available for bidding
    if (status === BidStatus.ACCEPTED) {
      await this.uploadRepository.update(bid.uploadId, {
        isAvailableForBidding: false,
      });

      // Reject all other pending bids for this upload
      await this.bidRepository.update(
        {
          uploadId: bid.uploadId,
          status: BidStatus.PENDING,
          id: { $ne: bidId } as any,
        },
        { status: BidStatus.REJECTED }
      );
    }

    return {
      id: updatedBid.id,
      uploadId: updatedBid.uploadId,
      companyId: updatedBid.companyId,
      companyName: bid.company.companyName,
      bidAmount: updatedBid.bidAmount,
      message: updatedBid.message,
      status: updatedBid.status,
      expiresAt: updatedBid.expiresAt,
      isPaid: updatedBid.isPaid,
      createdAt: updatedBid.createdAt,
    };
  }

  /**
   * Get available uploads for companies to bid on (with watermarked previews)
   */
  async getAvailableUploadsForBidding(): Promise<any[]> {
    const uploads = await this.uploadRepository.find({
      where: { isAvailableForBidding: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return uploads.map(upload => ({
      id: upload.id,
      filename: upload.filename,
      fileType: upload.fileType,
      fileSize: upload.fileSize,
      watermarkedPreviewUrl: upload.watermarkedPreviewUrl,
      createdAt: upload.createdAt,
      uploader: {
        id: upload.user.id,
        username: upload.user.username,
      },
    }));
  }
}
