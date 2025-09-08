import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { WatermarkService } from './watermark.service';
import { Upload, FileType, UploadStatus } from '../entities/upload.entity';
import { UploadRequestDto } from './dto/upload-request.dto';
import { Bid } from '../entities/bid.entity';
import { Company } from '../entities/company.entity';
import { FcmService } from '../notifications/fcm.service';

@Injectable()
export class UploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
  // Removed maxFileSize validation

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private cloudinaryService: CloudinaryService,
    private watermarkService: WatermarkService,
    private fcmService: FcmService,
  ) {}

  private validateFile(file: Express.Multer.File): void {
    // Removed file size validation
    
    // Check file type
    const isImage = this.allowedImageTypes.includes(file.mimetype);
    const isVideo = this.allowedVideoTypes.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, PNG images and MP4, MOV, AVI videos are allowed',
      );
    }
  }

  private validateTitleAndDescription(title: string, description: string): void {
    // Validate title
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Title is required and cannot be empty');
    }
    if (title.length > 100) {
      throw new BadRequestException('Title cannot exceed 100 characters');
    }

    // Validate description
    if (!description || description.trim().length === 0) {
      throw new BadRequestException('Description is required and cannot be empty');
    }
    if (description.length > 500) {
      throw new BadRequestException('Description cannot exceed 500 characters');
    }
  }

  private parseUserId(userId: string | number): number {
    if (typeof userId === 'number') {
      return userId;
    }
    
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      throw new BadRequestException('User ID must be a valid number');
    }
    
    return parsedUserId;
  }

  private getFileType(mimetype: string): FileType {
    return this.allowedImageTypes.includes(mimetype) ? FileType.IMAGE : FileType.VIDEO;
  }

  async uploadFile(file: Express.Multer.File, uploadData: UploadRequestDto) {
    // Validate file
    this.validateFile(file);

    // Validate title and description
    this.validateTitleAndDescription(uploadData.title, uploadData.description);

    // Parse and validate userId
    const parsedUserId = this.parseUserId(uploadData.userId);

    // Upload to Cloudinary
    const cloudinaryResult = await this.cloudinaryService.uploadFile(file);

    // Determine file type
    const fileType = this.getFileType(file.mimetype);

    // Create watermarked preview (for company previews, not shown to user)
    const watermarkedPreviewUrl = await this.watermarkService.createWatermarkedPreview(
      cloudinaryResult.publicId,
      fileType,
      'NEWSAREUS'
    );

    // Save to database (with title, description, and watermarked preview for companies)
    const upload = this.uploadRepository.create({
      title: uploadData.title.trim(),
      description: uploadData.description.trim(),
      filename: file.originalname,
      fileUrl: cloudinaryResult.url,
      fileType,
      fileSize: file.size,
      cloudinaryPublicId: cloudinaryResult.publicId,
      watermarkedPreviewUrl, // Store for company previews
      isAvailableForBidding: true,
      status: UploadStatus.PENDING, // Set initial status
      userId: parsedUserId, // Use parsed userId
    });

    const savedUpload = await this.uploadRepository.save(upload);

    // Send notification to all companies about new media upload
    await this.sendNewMediaNotification(savedUpload);

    // Return response WITHOUT watermarked preview URL to user
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: savedUpload.id,
        userId: savedUpload.userId,
        title: savedUpload.title,
        description: savedUpload.description,
        filename: savedUpload.filename,
        fileUrl: savedUpload.fileUrl, // Original file URL (no watermark)
        fileType: savedUpload.fileType,
        fileSize: savedUpload.fileSize,
        status: savedUpload.status,
        bidCount: 0, // No bids initially
        createdAt: savedUpload.createdAt,
        // watermarkedPreviewUrl is NOT included in user response
      },
    };
  }

  async getAllUploads() {
    const uploads = await this.uploadRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'All uploads retrieved successfully',
      data: await Promise.all(uploads.map(upload => this.mapUploadWithBids(upload))),
    };
  }

  async getUploadsByUserId(userId: number) {
    const uploads = await this.uploadRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: `Uploads for user ${userId} retrieved successfully`,
      data: await Promise.all(uploads.map(upload => this.mapUploadWithBids(upload))),
    };
  }

  async getUploadsWithPendingBids(userId: number) {
    // Get uploads that have pending bids
    const uploadsWithBids = await this.uploadRepository
      .createQueryBuilder('upload')
      .leftJoin('upload.bids', 'bid')
      .where('upload.userId = :userId', { userId })
      .andWhere('bid.status = :bidStatus', { bidStatus: 'pending' })
      .orderBy('upload.createdAt', 'DESC')
      .getMany();

    return {
      success: true,
      message: `Uploads with pending bids for user ${userId} retrieved successfully`,
      data: await Promise.all(uploadsWithBids.map(upload => this.mapUploadWithBids(upload))),
    };
  }

  async getUploadById(uploadId: number) {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    return {
      success: true,
      message: 'Upload details retrieved successfully',
      data: await this.mapUploadWithBids(upload),
    };
  }

  async deleteUpload(uploadId: number) {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    // Delete from Cloudinary
    if (upload.cloudinaryPublicId) {
      await this.cloudinaryService.deleteFile(upload.cloudinaryPublicId);
    }

    // Delete from database
    await this.uploadRepository.remove(upload);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  /**
   * Map upload entity to response DTO with bid count
   */
  private async mapUploadWithBids(upload: Upload) {
    // Get bids for this upload
    const bids = await this.bidRepository.find({
      where: { uploadId: upload.id },
      relations: ['company'],
      order: { createdAt: 'DESC' }
    });

    return {
      id: upload.id,
      userId: upload.userId,
      title: upload.title,
      description: upload.description,
      filename: upload.filename,
      fileUrl: upload.fileUrl, // Original file URL (no watermark)
      fileType: upload.fileType,
      fileSize: upload.fileSize,
      status: upload.status,
      bidCount: bids.length, // Just return the count instead of full array
      createdAt: upload.createdAt,
      // watermarkedPreviewUrl is NOT included in user response
    };
  }

  /**
   * Update upload status when bid is received
   */
  async updateUploadStatusOnBid(uploadId: number) {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId }
    });

    if (upload && upload.status === UploadStatus.PENDING) {
      await this.uploadRepository.update(uploadId, { 
        status: UploadStatus.BID_RECEIVED 
      });
    }
  }

  /**
   * Update upload status when bid is accepted/rejected
   */
  async updateUploadStatusOnBidAction(uploadId: number, bidStatus: string) {
    let newStatus: UploadStatus;
    
    if (bidStatus === 'accepted') {
      newStatus = UploadStatus.ACCEPTED;
    } else if (bidStatus === 'declined') {
      newStatus = UploadStatus.REJECTED;
    } else {
      return; // No status change needed
    }

    await this.uploadRepository.update(uploadId, { status: newStatus });
  }

  /**
   * Send notification to all companies when new media is uploaded
   */
  private async sendNewMediaNotification(upload: Upload): Promise<void> {
    try {
      // Get all active companies with FCM tokens
      const companies = await this.companyRepository.find({
        where: { isActive: true },
        select: ['fcmToken', 'companyName'],
      });

      const companiesWithTokens = companies.filter(company => company.fcmToken);
      
      if (companiesWithTokens.length === 0) {
        return; // No companies with FCM tokens
      }

      const tokens = companiesWithTokens.map(company => company.fcmToken!);

      const notification = {
        title: 'New Media Available! 📸',
        body: `New ${upload.fileType} "${upload.title}" is now available for bidding`,
        data: {
          type: 'new_media',
          uploadId: upload.id.toString(),
          fileType: upload.fileType,
          title: upload.title,
        },
      };

      await this.fcmService.sendToMultipleDevices(tokens, notification);
    } catch (error) {
      console.error('Failed to send new media notification:', error);
    }
  }
}
