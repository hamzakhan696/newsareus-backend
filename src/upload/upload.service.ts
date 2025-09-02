import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { WatermarkService } from './watermark.service';
import { Upload, FileType } from '../entities/upload.entity';
import { UploadRequestDto } from './dto/upload-request.dto';

@Injectable()
export class UploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
  // Removed maxFileSize validation

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    private cloudinaryService: CloudinaryService,
    private watermarkService: WatermarkService,
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
      userId: parsedUserId, // Use parsed userId
    });

    const savedUpload = await this.uploadRepository.save(upload);

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
      data: uploads.map(upload => ({
        id: upload.id,
        userId: upload.userId,
        title: upload.title,
        description: upload.description,
        filename: upload.filename,
        fileUrl: upload.fileUrl, // Original file URL (no watermark)
        fileType: upload.fileType,
        fileSize: upload.fileSize,
        createdAt: upload.createdAt,
        // watermarkedPreviewUrl is NOT included in user response
      })),
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
      data: uploads.map(upload => ({
        id: upload.id,
        userId: upload.userId,
        title: upload.title,
        description: upload.description,
        filename: upload.filename,
        fileUrl: upload.fileUrl, // Original file URL (no watermark)
        fileType: upload.fileType,
        fileSize: upload.fileSize,
        createdAt: upload.createdAt,
        // watermarkedPreviewUrl is NOT included in user response
      })),
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
}
