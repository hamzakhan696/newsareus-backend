import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmService } from './fcm.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  controllers: [NotificationsController],
  providers: [FcmService],
  exports: [FcmService],
})
export class NotificationsModule {}
