import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Company } from '../entities/company.entity';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyAuthResponseDto } from './dto/company-auth-response.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: CompanyRegisterDto): Promise<CompanyAuthResponseDto> {
    const {
      companyName,
      companyEmail,
      password,
      confirmPassword,
      phoneNumber,
      companyAddress,
      companyWebsite,
      businessLicense,
      companyType,
    } = registerDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if company already exists
    const existingCompany = await this.companyRepository.findOne({
      where: [
        { companyEmail },
        { companyName },
        { phoneNumber },
        { businessLicense },
      ],
    });

    if (existingCompany) {
      if (existingCompany.companyEmail === companyEmail) {
        throw new ConflictException('Company with this email already exists');
      }
      if (existingCompany.companyName === companyName) {
        throw new ConflictException('Company with this name already exists');
      }
      if (existingCompany.phoneNumber === phoneNumber) {
        throw new ConflictException('Company with this phone number already exists');
      }
      if (existingCompany.businessLicense === businessLicense) {
        throw new ConflictException('Company with this business license already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new company
    const company = this.companyRepository.create({
      companyName,
      companyEmail,
      password: hashedPassword,
      phoneNumber,
      companyAddress,
      companyWebsite,
      businessLicense,
      companyType,
    });

    const savedCompany = await this.companyRepository.save(company);

    // Generate JWT token
    const payload = {
      sub: savedCompany.id,
      companyEmail: savedCompany.companyEmail,
      companyName: savedCompany.companyName,
      type: 'company',
    };

    const accessToken = this.jwtService.sign(payload);

    // Return response without password
    const { password: _, ...companyWithoutPassword } = savedCompany;

    return {
      accessToken,
      company: companyWithoutPassword,
    };
  }

  async login(loginDto: CompanyLoginDto): Promise<CompanyAuthResponseDto> {
    const { companyEmail, password } = loginDto;

    // Find company by email
    const company = await this.companyRepository.findOne({
      where: { companyEmail },
    });

    if (!company) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if company is active
    if (!company.isActive) {
      throw new UnauthorizedException('Company account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: company.id,
      companyEmail: company.companyEmail,
      companyName: company.companyName,
      type: 'company',
    };

    const accessToken = this.jwtService.sign(payload);

    // Return response without password
    const { password: _, ...companyWithoutPassword } = company;

    return {
      accessToken,
      company: companyWithoutPassword,
    };
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new UnauthorizedException('Company not found');
    }

    return company;
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      select: [
        'id',
        'companyName',
        'companyEmail',
        'phoneNumber',
        'companyAddress',
        'companyWebsite',
        'businessLicense',
        'companyType',
        'isVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async updateVerificationStatus(id: number, isVerified: boolean): Promise<Company> {
    const company = await this.findById(id);
    company.isVerified = isVerified;
    return this.companyRepository.save(company);
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<Company> {
    const company = await this.findById(id);
    company.isActive = isActive;
    return this.companyRepository.save(company);
  }
}
