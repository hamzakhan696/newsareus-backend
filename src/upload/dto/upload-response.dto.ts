import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../entities/upload.entity';

export class UploadDataDto {
  @ApiProperty({
    description: 'Upload ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User ID who uploaded the file (optional)',
    example: 5,
    required: false,
  })
  userId?: number;

  @ApiProperty({
    description: 'Title of the upload',
    example: 'My Amazing Video',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the upload',
    example: 'This is a beautiful video showcasing amazing content',
  })
  description: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'mypic.png',
  })
  filename: string;

  @ApiProperty({
    description: 'Cloudinary URL of the uploaded file',
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/mypic.png',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Type of file (image or video)',
    enum: FileType,
    example: FileType.IMAGE,
  })
  fileType: FileType;

  @ApiProperty({
    description: 'Upload creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  createdAt: Date;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'File uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Upload data',
    type: UploadDataDto,
  })
  data: UploadDataDto;
}

export class UploadsListResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'User uploads retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of uploads',
    type: [UploadDataDto],
  })
  data: UploadDataDto[];
}

export class DeleteResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'File deleted successfully',
  })
  message: string;
}
