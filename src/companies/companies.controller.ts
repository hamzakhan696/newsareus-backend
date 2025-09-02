import { Controller, Get, Param, ParseIntPipe, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new company' })
  @ApiBody({ type: CompanyRegisterDto })
  @ApiResponse({ status: 201, description: 'Company registered successfully' })
  @ApiResponse({ status: 409, description: 'Company already exists' })
  async register(@Body() registerDto: CompanyRegisterDto) {
    return this.companiesService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Company login' })
  @ApiBody({ type: CompanyLoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: CompanyLoginDto) {
    return this.companiesService.login(loginDto);
  }

  @Get('preview-videos')
  @ApiOperation({ summary: 'Get all watermarked video previews (excluding already bid items)' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Video previews retrieved successfully' })
  async getPreviewVideos(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.companiesService.getPreviewVideos(companyId);
  }

  @Get('preview-video/:id')
  @ApiOperation({ summary: 'Get specific watermarked video preview (excluding if already bid on)' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Video preview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found or already bid on' })
  async getPreviewVideo(
    @Param('id', ParseIntPipe) id: number, 
    @Query('companyId', ParseIntPipe) companyId: number
  ) {
    return this.companiesService.getPreviewVideo(id, companyId);
  }

  @Get('preview-images')
  @ApiOperation({ summary: 'Get all watermarked image previews (excluding already bid items)' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Image previews retrieved successfully' })
  async getPreviewImages(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.companiesService.getPreviewImages(companyId);
  }

  @Get('preview-image/:id')
  @ApiOperation({ summary: 'Get specific watermarked image preview (excluding if already bid on)' })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Image preview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Image not found or already bid on' })
  async getPreviewImage(
    @Param('id', ParseIntPipe) id: number, 
    @Query('companyId', ParseIntPipe) companyId: number
  ) {
    return this.companiesService.getPreviewImage(id, companyId);
  }

  @Get('preview-media')
  @ApiOperation({ summary: 'Get all watermarked media previews (excluding already bid items)' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Media previews retrieved successfully' })
  async getPreviewMedia(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.companiesService.getPreviewMedia(companyId);
  }

  @Get('my-bids')
  @ApiOperation({ summary: 'Get all bids for the specified company' })
  @ApiQuery({ name: 'companyId', required: true, type: Number, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company bids retrieved successfully' })
  async getCompanyBids(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.companiesService.getCompanyBids(companyId);
  }
}
