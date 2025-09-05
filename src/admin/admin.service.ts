import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
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
}
