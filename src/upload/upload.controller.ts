import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto, UploadsListResponseDto, DeleteResponseDto } from './dto/upload-response.dto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'User ID (optional)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (JPG, JPEG, PNG images or MP4, MOV, AVI videos, max 100MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file type or size',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const userIdNumber = userId ? parseInt(userId, 10) : undefined;
    return this.uploadService.uploadFile(file, userIdNumber);
  }

  @Get('my-uploads')
  @ApiOperation({ summary: 'Get all uploads' })
  @ApiResponse({
    status: 200,
    description: 'All uploads retrieved successfully',
    type: UploadsListResponseDto,
  })
  async getAllUploads() {
    return this.uploadService.getAllUploads();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an upload' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - upload not found',
  })
  async deleteUpload(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.deleteUpload(id);
  }
}
