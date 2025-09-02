import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyAuthResponseDto } from './dto/company-auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company registered successfully',
    type: CompanyAuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or passwords do not match',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - company already exists',
  })
  async register(@Body() registerDto: CompanyRegisterDto): Promise<CompanyAuthResponseDto> {
    return this.companiesService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login company' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: CompanyAuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() loginDto: CompanyLoginDto): Promise<CompanyAuthResponseDto> {
    return this.companiesService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({
    status: 200,
    description: 'Company profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getProfile(@Request() req) {
    const company = await this.companiesService.findById(req.user.sub);
    const { password, ...companyWithoutPassword } = company;
    return companyWithoutPassword;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all companies (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getAllCompanies(@Request() req) {
    // Note: In a real application, you'd want to add admin role checking here
    return this.companiesService.findAll();
  }

  @Get('preview-videos')
  @ApiOperation({ summary: 'Get all videos available for bidding with watermarked previews (No authentication required)' })
  @ApiResponse({
    status: 200,
    description: 'Videos with watermarked previews retrieved successfully',
  })
  async getPreviewVideos() {
    return this.companiesService.getPreviewVideos();
  }

  @Get('preview-images')
  @ApiOperation({ summary: 'Get all images available for bidding with watermarked previews (No authentication required)' })
  @ApiResponse({
    status: 200,
    description: 'Images with watermarked previews retrieved successfully',
  })
  async getPreviewImages() {
    return this.companiesService.getPreviewImages();
  }

  @Get('preview-media')
  @ApiOperation({ summary: 'Get all media (images and videos) available for bidding with watermarked previews (No authentication required)' })
  @ApiResponse({
    status: 200,
    description: 'All media with watermarked previews retrieved successfully',
  })
  async getPreviewMedia() {
    return this.companiesService.getPreviewMedia();
  }

  @Get('preview-video/:id')
  @ApiOperation({ summary: 'Get specific video preview with watermark (No authentication required)' })
  @ApiParam({ name: 'id', description: 'Video ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Video preview retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async getPreviewVideo(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getPreviewVideo(id);
  }

  @Get('preview-image/:id')
  @ApiOperation({ summary: 'Get specific image preview with watermark (No authentication required)' })
  @ApiParam({ name: 'id', description: 'Image ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Image preview retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async getPreviewImage(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getPreviewImage(id);
  }
}
