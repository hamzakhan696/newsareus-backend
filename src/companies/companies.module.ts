import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from '../entities/company.entity';
import { Upload } from '../entities/upload.entity';
import { Bid } from '../entities/bid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Upload, Bid]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
