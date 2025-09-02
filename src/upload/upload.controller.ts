import { Controller, Get, Post, Delete, Param, Query, Body, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto, UploadsListResponseDto, DeleteResponseDto } from './dto/upload-response.dto';
import { UploadRequestDto } from './dto/upload-request.dto';

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
  @ApiOperation({ summary: 'Upload a file with title and description' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (JPG, JPEG, PNG images or MP4, MOV, AVI videos)',
        },
        title: {
          type: 'string',
          description: 'Title of the upload (max 100 characters)',
          maxLength: 100,
        },
        description: {
          type: 'string',
          description: 'Description of the upload (max 500 characters)',
          maxLength: 500,
        },
        userId: {
          type: 'number',
          description: 'User ID (required)',
        },
      },
      required: ['file', 'title', 'description', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file type, missing title/description/userId, or validation failed',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadRequestDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    return this.uploadService.uploadFile(file, uploadData);
  }

  @Get('my-uploads')
  @ApiOperation({ summary: 'Get uploads by user ID' })
  @ApiQuery({ name: 'userId', required: true, type: Number, description: 'User ID to filter uploads' })
  @ApiResponse({
    status: 200,
    description: 'User uploads retrieved successfully',
    type: UploadsListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - userId is required',
  })
  async getUploadsByUserId(@Query('userId', ParseIntPipe) userId: number) {
    return this.uploadService.getUploadsByUserId(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an upload' })
  @ApiResponse({
    status: 200,
    description: 'Upload deleted successfully',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found',
  })
  async deleteUpload(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.deleteUpload(id);
  }
}
