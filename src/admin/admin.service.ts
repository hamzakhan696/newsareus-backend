import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Upload, UploadStatus } from '../entities/upload.entity';
import { Bid, BidStatus } from '../entities/bid.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
  ) {}

  async getUsers(page: number = 1, search?: string) {
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = this.userRepository.createQueryBuilder('user');

    // Add search functionality
    if (search) {
      query = query.where('user.username ILIKE :search', { search: `%${search}%` });
    }

    // Get total count for pagination
    const totalCount = await query.getCount();

    // Get users with pagination
    const users = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    // Map users to response format
    const mappedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
      // Add more fields as needed
    }));

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: mappedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getCompanies(page: number = 1, search?: string) {
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = this.companyRepository.createQueryBuilder('company');

    // Add search functionality
    if (search) {
      query = query.where('company.companyName ILIKE :search', { search: `%${search}%` });
    }

    // Get total count for pagination
    const totalCount = await query.getCount();

    // Get companies with pagination
    const companies = await query
      .skip(skip)
      .take(limit)
      .orderBy('company.createdAt', 'DESC')
      .getMany();

    // Map companies to response format
    const mappedCompanies = companies.map(company => ({
      id: company.id,
      companyName: company.companyName,
      companyEmail: company.companyEmail,
      createdAt: company.createdAt,
      // Add more fields as needed
    }));

    return {
      success: true,
      message: 'Companies retrieved successfully',
      data: mappedCompanies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getDashboardStats() {
    // Get user statistics
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { role: 'user' } });
    const adminUsers = await this.userRepository.count({ where: { role: 'admin' } });

    // Get company statistics
    const totalCompanies = await this.companyRepository.count();
    const activeCompanies = await this.companyRepository.count({ where: { isActive: true } });
    const verifiedCompanies = await this.companyRepository.count({ where: { isVerified: true } });

    // Get upload statistics
    const totalUploads = await this.uploadRepository.count();
    const pendingUploads = await this.uploadRepository.count({ where: { status: UploadStatus.PENDING } });
    const approvedUploads = await this.uploadRepository.count({ where: { status: UploadStatus.APPROVED } });
    const rejectedUploads = await this.uploadRepository.count({ where: { status: UploadStatus.REJECTED } });

    // Get bid statistics
    const totalBids = await this.bidRepository.count();
    const activeBids = await this.bidRepository.count({ where: { status: BidStatus.PENDING } });
    const completedBids = await this.bidRepository.count({ where: { status: BidStatus.ACCEPTED } });

    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUploads = await this.uploadRepository.count({
      where: {
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        } as any,
      },
    });

    const todayBids = await this.bidRepository.count({
      where: {
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        } as any,
      },
    });

    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers,
        },
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          verified: verifiedCompanies,
        },
        uploads: {
          total: totalUploads,
          pending: pendingUploads,
          approved: approvedUploads,
          rejected: rejectedUploads,
          today: todayUploads,
        },
        bids: {
          total: totalBids,
          active: activeBids,
          completed: completedBids,
          today: todayBids,
        },
      },
    };
  }

  async getMediaStats() {
    const totalMedia = await this.uploadRepository.count();
    const pendingReview = await this.uploadRepository.count({ where: { status: UploadStatus.PENDING } });
    const approvedToday = await this.uploadRepository.count({
      where: {
        status: UploadStatus.APPROVED,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        } as any,
      },
    });
    const flaggedContent = await this.uploadRepository.count({ where: { status: UploadStatus.REJECTED } });

    return {
      success: true,
      message: 'Media statistics retrieved successfully',
      data: {
        totalMedia,
        pendingReview,
        approvedToday,
        flaggedContent,
      },
    };
  }

  async getBiddingStats() {
    const activeBids = await this.bidRepository.count({ where: { status: BidStatus.PENDING } });
    const completedBids = await this.bidRepository.count({ where: { status: BidStatus.ACCEPTED } });
    
    // Calculate today's revenue (simplified - you might want to add a revenue field to bids)
    const todayBids = await this.bidRepository.find({
      where: {
        status: BidStatus.ACCEPTED,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        } as any,
      },
    });
    
    const todayRevenue = todayBids.reduce((sum, bid) => sum + (bid.amount || 0), 0);

    // Get bids closing soon (within next 24 hours)
    const closingSoon = await this.bidRepository.count({
      where: {
        status: BidStatus.PENDING,
        // You might want to add an endTime field to bids for this calculation
      },
    });

    return {
      success: true,
      message: 'Bidding statistics retrieved successfully',
      data: {
        activeBids,
        todayRevenue,
        closingSoon,
        completedToday: todayBids.length,
      },
    };
  }

  async getRecentActivity() {
    // Get recent uploads
    const recentUploads = await this.uploadRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    // Get recent bids
    const recentBids = await this.bidRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['company', 'upload'],
    });

    // Format activity data
    const activities = [];

    // Add upload activities
    recentUploads.forEach(upload => {
      activities.push({
        id: `upload_${upload.id}`,
        type: 'media_upload',
        action: 'Media uploaded',
        user: upload.user ? `${upload.user.username} (Creator)` : 'Unknown User',
        details: upload.title,
        time: this.getTimeAgo(upload.createdAt),
        status: upload.status,
      });
    });

    // Add bid activities
    recentBids.forEach(bid => {
      activities.push({
        id: `bid_${bid.id}`,
        type: 'bid_placed',
        action: 'Bid placed',
        user: bid.company ? `${bid.company.companyName} (Agency)` : 'Unknown Company',
        details: `$${bid.amount} for ${bid.upload?.title || 'Unknown Media'}`,
        time: this.getTimeAgo(bid.createdAt),
        status: bid.status,
      });
    });

    // Sort by creation time and take top 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return {
      success: true,
      message: 'Recent activity retrieved successfully',
      data: activities.slice(0, 10),
    };
  }

  async getMediaUploads(page: number = 1, search?: string) {
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = this.uploadRepository.createQueryBuilder('upload')
      .leftJoinAndSelect('upload.user', 'user');

    // Add search functionality
    if (search) {
      query = query.where('upload.title ILIKE :search OR upload.description ILIKE :search', { 
        search: `%${search}%` 
      });
    }

    // Get total count for pagination
    const totalCount = await query.getCount();

    // Get uploads with pagination
    const uploads = await query
      .skip(skip)
      .take(limit)
      .orderBy('upload.createdAt', 'DESC')
      .getMany();

    // Map uploads to response format
    const mappedUploads = uploads.map(upload => ({
      id: upload.id,
      title: upload.title,
      description: upload.description,
      fileType: upload.fileType,
      status: upload.status,
      createdAt: upload.createdAt,
      creator: upload.user ? upload.user.username : 'Unknown',
      creatorEmail: upload.user ? upload.user.email : 'Unknown',
      fileUrl: upload.fileUrl,
      filename: upload.filename,
    }));

    return {
      success: true,
      message: 'Media uploads retrieved successfully',
      data: mappedUploads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getBids(page: number = 1, search?: string) {
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = this.bidRepository.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.company', 'company')
      .leftJoinAndSelect('bid.upload', 'upload')
      .leftJoinAndSelect('upload.user', 'user');

    // Add search functionality
    if (search) {
      query = query.where('upload.title ILIKE :search OR company.companyName ILIKE :search', { 
        search: `%${search}%` 
      });
    }

    // Get total count for pagination
    const totalCount = await query.getCount();

    // Get bids with pagination
    const bids = await query
      .skip(skip)
      .take(limit)
      .orderBy('bid.createdAt', 'DESC')
      .getMany();

    // Map bids to response format
    const mappedBids = bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      createdAt: bid.createdAt,
      mediaTitle: bid.upload ? bid.upload.title : 'Unknown Media',
      creator: bid.upload?.user ? bid.upload.user.username : 'Unknown',
      company: bid.company ? bid.company.companyName : 'Unknown Company',
      companyEmail: bid.company ? bid.company.companyEmail : 'Unknown',
      fileUrl: bid.upload ? bid.upload.fileUrl : null,
      fileType: bid.upload ? bid.upload.fileType : null,
      filename: bid.upload ? bid.upload.filename : null,
    }));

    return {
      success: true,
      message: 'Bids retrieved successfully',
      data: mappedBids,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}
