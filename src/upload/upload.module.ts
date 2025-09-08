import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryService } from './cloudinary.service';
import { WatermarkService } from './watermark.service';
import { Upload } from '../entities/upload.entity';
import { Bid } from '../entities/bid.entity';
import { Company } from '../entities/company.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upload, Bid, Company]),
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryService, WatermarkService],
  exports: [UploadService],
})
export class UploadModule {}
