import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
}
