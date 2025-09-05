import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

export interface AdminPayload {
  email: string;
  role: 'admin';
  sub: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: {
      email: string;
      role: string;
    };
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<AdminPayload | null> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    // For simplicity, we'll use plain text comparison
    // In production, you should hash the password
    if (email === adminEmail && password === adminPassword) {
      return {
        email: adminEmail,
        role: 'admin',
        sub: 'admin-user',
      };
    }

    return null;
  }

  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const admin = await this.validateAdmin(email, password);
    
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload: AdminPayload = {
      email: admin.email,
      role: admin.role,
      sub: admin.sub,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          email: admin.email,
          role: admin.role,
        },
      },
    };
  }

  async validateToken(payload: AdminPayload): Promise<AdminPayload> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    
    if (payload.email !== adminEmail || payload.role !== 'admin') {
      throw new UnauthorizedException('Invalid admin token');
    }

    return payload;
  }
}
