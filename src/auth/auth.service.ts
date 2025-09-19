import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { MailService } from '../notifications/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, phoneNumber, password, fcmToken } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }, { phoneNumber }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email, username, or phone number already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      fcmToken,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        createdAt: savedUser.createdAt,
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, fcmToken } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update FCM token if provided
    if (fcmToken && fcmToken !== user.fcmToken) {
      await this.userRepository.update(user.id, { fcmToken });
      user.fcmToken = fcmToken;
    }

    // Generate JWT token
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        token,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email, type } = dto;

    // Try to find account based on type; do not reveal existence in response
    let accountExists = false;
    if (type === 'user') {
      const user = await this.userRepository.findOne({ where: { email } });
      accountExists = !!user;
    } else if (type === 'company') {
      const company = await this.companyRepository.findOne({ where: { companyEmail: email } });
      accountExists = !!company;
    }

    // Generate a short-lived token regardless to keep timing consistent
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token = this.jwtService.sign(
      { email, type, t: rawToken },
      { expiresIn: '20m' },
    );

    // Build reset URL pointing to the provided frontend
    const resetUrl = `https://newsareus.com/new-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&type=${encodeURIComponent(type)}`;

    // For now, log the link (placeholder for email provider integration)
    // In production, send email regardless of existence to avoid enumeration
    // You may integrate with a MailService here
    if (accountExists) {
      try {
        await this.mailService.sendPasswordResetEmail(email, resetUrl);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to send reset email', e);
      }
    }

    return {
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, type, token, newPassword } = dto;

    // Verify JWT token
    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Basic claims check
    if (!decoded || decoded.email !== email || decoded.type !== type) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Update password based on type
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    if (type === 'user') {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      await this.userRepository.update(user.id, { password: hashedPassword });
    } else {
      const company = await this.companyRepository.findOne({ where: { companyEmail: email } });
      if (!company) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      await this.companyRepository.update(company.id, { password: hashedPassword });
    }

    return {
      success: true,
      message: 'Password reset successful.',
    };
  }
}