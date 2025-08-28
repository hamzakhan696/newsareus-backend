import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadResponseDto, UploadsListResponseDto, DeleteResponseDto } from './dto/upload-response.dto';

@ApiTags('upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
// @UseGuards(JwtAuthGuard)
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Missing authenticated user context');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.uploadFile(file, req.user.id);
  }

  @Get('my-uploads')
  @ApiOperation({ summary: 'Get user uploads' })
  @ApiResponse({
    status: 200,
    description: 'User uploads retrieved successfully',
    type: UploadsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getUserUploads(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Missing authenticated user context');
    }
    return this.uploadService.getUserUploads(req.user.id);
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
    description: 'Bad request - upload not found or access denied',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async deleteUpload(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Missing authenticated user context');
    }
    return this.uploadService.deleteUpload(id, req.user.id);
  }
}
