import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { Upload, FileType } from '../entities/upload.entity';
import { Bid } from '../entities/bid.entity';
import { JwtService } from '@nestjs/jwt';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyAuthResponseDto } from './dto/company-auth-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    private jwtService: JwtService,
  ) {}

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { companyEmail: email } });
  }

  async register(registerDto: CompanyRegisterDto): Promise<CompanyAuthResponseDto> {
    const { companyName, companyEmail, password, phoneNumber, businessLicense, companyAddress, companyWebsite, companyType } = registerDto;

    // Check if company already exists
    const existingCompany = await this.companyRepository.findOne({
      where: [
        { companyEmail },
        { companyName },
        { phoneNumber },
        { businessLicense }
      ],
    });

    if (existingCompany) {
      throw new ConflictException('Company with this email, name, phone number, or business license already exists');
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
    const payload = { companyName: company.companyName, sub: company.id, type: 'company' };
    const accessToken = this.jwtService.sign(payload);

    // Return response in the expected format
    return {
      accessToken,
      company: {
        id: savedCompany.id,
        companyName: savedCompany.companyName,
        companyEmail: savedCompany.companyEmail,
        phoneNumber: savedCompany.phoneNumber,
        companyAddress: savedCompany.companyAddress,
        companyWebsite: savedCompany.companyWebsite,
        businessLicense: savedCompany.businessLicense,
        companyType: savedCompany.companyType,
        isVerified: savedCompany.isVerified,
        isActive: savedCompany.isActive,
        createdAt: savedCompany.createdAt,
      },
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, company.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if company is active
    if (!company.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate JWT token
    const payload = { companyName: company.companyName, sub: company.id, type: 'company' };
    const accessToken = this.jwtService.sign(payload);

    // Return response in the expected format
    return {
      accessToken,
      company: {
        id: company.id,
        companyName: company.companyName,
        companyEmail: company.companyEmail,
        phoneNumber: company.phoneNumber,
        companyAddress: company.companyAddress,
        companyWebsite: company.companyWebsite,
        businessLicense: company.businessLicense,
        companyType: company.companyType,
        isVerified: company.isVerified,
        isActive: company.isActive,
        createdAt: company.createdAt,
      },
    };
  }

  /**
   * Get preview videos excluding those already bid on by the company
   */
  async getPreviewVideos(companyId: number) {
    // Get all available videos
    const availableVideos = await this.uploadRepository.find({
      where: {
        fileType: FileType.VIDEO,
        isAvailableForBidding: true,
      },
      select: ['id', 'title', 'description', 'filename', 'fileType', 'watermarkedPreviewUrl', 'createdAt', 'userId'],
      order: { createdAt: 'DESC' },
    });

    // Get videos that this company has already bid on
    const companyBids = await this.bidRepository.find({
      where: { companyId },
      select: ['uploadId'],
    });

    const bidUploadIds = companyBids.map(bid => bid.uploadId);

    // Filter out videos that company has already bid on
    const filteredVideos = availableVideos.filter(video => !bidUploadIds.includes(video.id));

    return filteredVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      fileType: video.fileType,
      previewUrl: video.watermarkedPreviewUrl,
      createdAt: video.createdAt,
      userId: video.userId,
    }));
  }

  /**
   * Get preview video by ID (excluding if already bid on)
   */
  async getPreviewVideo(id: number, companyId: number) {
    const video = await this.uploadRepository.findOne({
      where: {
        id,
        fileType: FileType.VIDEO,
        isAvailableForBidding: true,
      },
      select: ['id', 'title', 'description', 'filename', 'fileType', 'watermarkedPreviewUrl', 'createdAt', 'userId'],
    });

    if (!video) {
      throw new NotFoundException('Video not found or not available for bidding');
    }

    // Check if company has already bid on this video
    const existingBid = await this.bidRepository.findOne({
      where: { companyId, uploadId: id },
    });

    if (existingBid) {
      throw new NotFoundException('You have already bid on this video');
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      fileType: video.fileType,
      previewUrl: video.watermarkedPreviewUrl,
      createdAt: video.createdAt,
      userId: video.userId,
    };
  }

  /**
   * Get preview images excluding those already bid on by the company
   */
  async getPreviewImages(companyId: number) {
    // Get all available images
    const availableImages = await this.uploadRepository.find({
      where: {
        fileType: FileType.IMAGE,
        isAvailableForBidding: true,
      },
      select: ['id', 'title', 'description', 'filename', 'fileType', 'watermarkedPreviewUrl', 'createdAt', 'userId'],
      order: { createdAt: 'DESC' },
    });

    // Get images that this company has already bid on
    const companyBids = await this.bidRepository.find({
      where: { companyId },
      select: ['uploadId'],
    });

    const bidUploadIds = companyBids.map(bid => bid.uploadId);

    // Filter out images that company has already bid on
    const filteredImages = availableImages.filter(image => !bidUploadIds.includes(image.id));

    return filteredImages.map(image => ({
      id: image.id,
      title: image.title,
      description: image.description,
      filename: image.filename,
      fileType: image.fileType,
      previewUrl: image.watermarkedPreviewUrl,
      createdAt: image.createdAt,
      userId: image.userId,
    }));
  }

  /**
   * Get preview image by ID (excluding if already bid on)
   */
  async getPreviewImage(id: number, companyId: number) {
    const image = await this.uploadRepository.findOne({
      where: {
        id,
        fileType: FileType.IMAGE,
        isAvailableForBidding: true,
      },
      select: ['id', 'title', 'description', 'filename', 'fileType', 'watermarkedPreviewUrl', 'createdAt', 'userId'],
    });

    if (!image) {
      throw new NotFoundException('Image not found or not available for bidding');
    }

    // Check if company has already bid on this image
    const existingBid = await this.bidRepository.findOne({
      where: { companyId, uploadId: id },
    });

    if (existingBid) {
      throw new NotFoundException('You have already bid on this image');
    }

    return {
      id: image.id,
      title: image.title,
      description: image.description,
      filename: image.filename,
      fileType: image.fileType,
      previewUrl: image.watermarkedPreviewUrl,
      createdAt: image.createdAt,
      userId: image.userId,
    };
  }

  /**
   * Get all preview media (images and videos) excluding those already bid on
   */
  async getPreviewMedia(companyId: number) {
    // Get all available media
    const availableMedia = await this.uploadRepository.find({
      where: {
        isAvailableForBidding: true,
      },
      select: ['id', 'title', 'description', 'filename', 'fileType', 'watermarkedPreviewUrl', 'createdAt', 'userId'],
      order: { createdAt: 'DESC' },
    });

    // Get media that this company has already bid on
    const companyBids = await this.bidRepository.find({
      where: { companyId },
      select: ['uploadId'],
    });

    const bidUploadIds = companyBids.map(bid => bid.uploadId);

    // Filter out media that company has already bid on
    const filteredMedia = availableMedia.filter(media => !bidUploadIds.includes(media.id));

    return filteredMedia.map(media => ({
      id: media.id,
      title: media.title,
      description: media.description,
      filename: media.filename,
      fileType: media.fileType,
      previewUrl: media.watermarkedPreviewUrl,
      createdAt: media.createdAt,
      userId: media.userId,
    }));
  }

  /**
   * Get company's own bids
   */
  async getCompanyBids(companyId: number) {
    const bids = await this.bidRepository.find({
      where: { companyId },
      relations: ['upload'],
      order: { createdAt: 'DESC' },
    });

    return bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      message: bid.message,
      bidType: bid.bidType,
      status: bid.status,
      upload: {
        id: bid.upload.id,
        title: bid.upload.title,
        description: bid.upload.description,
        filename: bid.upload.filename,
        fileType: bid.upload.fileType,
      },
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
    }));
  }
}
