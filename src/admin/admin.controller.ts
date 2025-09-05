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
}
