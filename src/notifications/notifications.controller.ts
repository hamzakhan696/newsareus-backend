import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FcmService } from './fcm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private fcmService: FcmService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


  @Get('status')
  @ApiOperation({ summary: 'Check FCM service status' })
  @ApiResponse({ status: 200, description: 'FCM service status' })
  async getFcmStatus() {
    try {
      // Try to get Firebase app instance
      const isInitialized = !!this.fcmService['firebaseApp'];
      
      return {
        success: true,
        fcmInitialized: isInitialized,
        message: isInitialized ? 'FCM service is properly initialized' : 'FCM service is not initialized',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        fcmInitialized: false,
        message: 'FCM service error',
        error: error.message,
      };
    }
  }


  @Get('users-with-tokens')
  @ApiOperation({ summary: 'Get all users with FCM tokens' })
  @ApiResponse({ status: 200, description: 'List of users with FCM tokens' })
  async getUsersWithTokens() {
    try {
      const users = await this.userRepository.find({
        where: { fcmToken: Not(IsNull()) },
        select: ['id', 'username', 'email', 'fcmToken'],
      });

      return {
        success: true,
        count: users.length,
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fcmToken: user.fcmToken ? `${user.fcmToken.substring(0, 20)}...` : null,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching users with FCM tokens',
        error: error.message,
      };
    }
  }
}
