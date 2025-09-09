import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FcmService, NotificationPayload } from './fcm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

export class TestNotificationDto {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private fcmService: FcmService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('test')
  @ApiOperation({ summary: 'Send test notification to a specific FCM token' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid FCM token or notification failed' })
  async sendTestNotification(@Body() testDto: TestNotificationDto) {
    try {
      const payload: NotificationPayload = {
        title: testDto.title || 'Test Notification',
        body: testDto.body || 'This is a test notification from NewsAreUs backend',
        data: testDto.data || { type: 'test', timestamp: new Date().toISOString() },
      };

      const result = await this.fcmService.sendToDevice(testDto.fcmToken, payload);
      
      return {
        success: result,
        message: result ? 'Test notification sent successfully' : 'Failed to send notification',
        payload,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error sending test notification',
        error: error.message,
      };
    }
  }

  @Post('test-user')
  @ApiOperation({ summary: 'Send test notification to any user with FCM token (no auth required)' })
  @ApiResponse({ status: 200, description: 'Test notification sent to user' })
  @ApiResponse({ status: 404, description: 'User FCM token not found' })
  async sendTestNotificationToUser(@Body() body: { title?: string; body?: string }) {
    try {
      // Get user from JWT token (you'll need to implement this based on your auth system)
      // For now, we'll get the first user with FCM token
      const user = await this.userRepository.findOne({
        where: { fcmToken: Not(IsNull()) },
        select: ['id', 'username', 'fcmToken'],
      });

      if (!user || !user.fcmToken) {
        return {
          success: false,
          message: 'No user with FCM token found',
        };
      }

      const payload: NotificationPayload = {
        title: body.title || 'Test Notification',
        body: body.body || `Hello ${user.username}! This is a test notification from NewsAreUs backend`,
        data: { 
          type: 'test', 
          userId: user.id.toString(),
          timestamp: new Date().toISOString() 
        },
      };

      const result = await this.fcmService.sendToDevice(user.fcmToken, payload);
      
      return {
        success: result,
        message: result ? `Test notification sent to user: ${user.username}` : 'Failed to send notification',
        user: {
          id: user.id,
          username: user.username,
        },
        payload,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error sending test notification to user',
        error: error.message,
      };
    }
  }

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

  @Post('test-user-by-id')
  @ApiOperation({ summary: 'Send test notification to specific user by ID' })
  @ApiResponse({ status: 200, description: 'Test notification sent to user' })
  @ApiResponse({ status: 404, description: 'User not found or no FCM token' })
  async sendTestNotificationToUserById(@Body() body: { userId: number; title?: string; body?: string }) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: body.userId },
        select: ['id', 'username', 'fcmToken'],
      });

      if (!user || !user.fcmToken) {
        return {
          success: false,
          message: `User with ID ${body.userId} not found or has no FCM token`,
        };
      }

      const payload: NotificationPayload = {
        title: body.title || 'Test Notification',
        body: body.body || `Hello ${user.username}! This is a test notification from NewsAreUs backend`,
        data: { 
          type: 'test', 
          userId: user.id.toString(),
          timestamp: new Date().toISOString() 
        },
      };

      const result = await this.fcmService.sendToDevice(user.fcmToken, payload);
      
      return {
        success: result,
        message: result ? `Test notification sent to user: ${user.username}` : 'Failed to send notification',
        user: {
          id: user.id,
          username: user.username,
        },
        payload,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error sending test notification to user',
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
