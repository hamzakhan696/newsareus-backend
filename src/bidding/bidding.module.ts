import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';
import { Bid } from '../entities/bid.entity';
import { Upload } from '../entities/upload.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Upload, Company]),
  ],
  controllers: [BiddingController],
  providers: [BiddingService],
  exports: [BiddingService],
})
export class BiddingModule {}
