import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UsersListResponseDto, CompaniesListResponseDto } from './dto/admin-response.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by username' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, search);
  }

  @Get('companies')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all companies with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by company name' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
    type: CompaniesListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getCompanies(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('search') search?: string,
  ) {
    return this.adminService.getCompanies(page, search);
  }

  @Get('dashboard/stats')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('media/stats')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get media statistics' })
  @ApiResponse({
    status: 200,
    description: 'Media statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getMediaStats() {
    return this.adminService.getMediaStats();
  }

  @Get('bidding/stats')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bidding statistics' })
  @ApiResponse({
    status: 200,
    description: 'Bidding statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getBiddingStats() {
    return this.adminService.getBiddingStats();
  }

  @Get('activity/recent')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent platform activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('media')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all media uploads with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title or description' })
  @ApiResponse({
    status: 200,
    description: 'Media uploads retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getMediaUploads(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('search') search?: string,
  ) {
    return this.adminService.getMediaUploads(page, search);
  }

  @Get('bids')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bids with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by media title or company name' })
  @ApiResponse({
    status: 200,
    description: 'Bids retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin authentication required',
  })
  async getBids(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('search') search?: string,
  ) {
    return this.adminService.getBids(page, search);
  }
}
