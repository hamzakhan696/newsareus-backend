import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { Upload, FileType } from '../entities/upload.entity';

@Injectable()
export class UploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
  private readonly maxFileSize = 100 * 1024 * 1024; // 100 MB

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    private cloudinaryService: CloudinaryService,
  ) {}

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 100 MB limit');
    }

    // Check file type
    const isImage = this.allowedImageTypes.includes(file.mimetype);
    const isVideo = this.allowedVideoTypes.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, PNG images and MP4, MOV, AVI videos are allowed',
      );
    }
  }

  private getFileType(mimetype: string): FileType {
    return this.allowedImageTypes.includes(mimetype) ? FileType.IMAGE : FileType.VIDEO;
  }

  async uploadFile(file: Express.Multer.File, userId: number) {
    // Validate file
    this.validateFile(file);

    // Upload to Cloudinary
    const cloudinaryResult = await this.cloudinaryService.uploadFile(file);

    // Determine file type
    const fileType = this.getFileType(file.mimetype);

    // Save to database
    const upload = this.uploadRepository.create({
      userId,
      filename: file.originalname,
      fileUrl: cloudinaryResult.url,
      fileType,
      fileSize: file.size,
      cloudinaryPublicId: cloudinaryResult.publicId,
    });

    const savedUpload = await this.uploadRepository.save(upload);

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: savedUpload.id,
        userId: savedUpload.userId,
        filename: savedUpload.filename,
        fileUrl: savedUpload.fileUrl,
        fileType: savedUpload.fileType,
        createdAt: savedUpload.createdAt,
      },
    };
  }

  async getUserUploads(userId: number) {
    const uploads = await this.uploadRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'User uploads retrieved successfully',
      data: uploads,
    };
  }

  async deleteUpload(uploadId: number, userId: number) {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId, userId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found or access denied');
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
