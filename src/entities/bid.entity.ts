import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Upload } from './upload.entity';
import { Company } from './company.entity';

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('bids')
export class Bid {
  @ApiProperty({
    description: 'Bid ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Upload ID that this bid is for',
    example: 1,
  })
  @Column()
  uploadId: number;

  @ApiProperty({
    description: 'Company ID that placed this bid',
    example: 1,
  })
  @Column()
  companyId: number;

  @ApiProperty({
    description: 'Bid amount in USD',
    example: 150.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bidAmount: number;

  @ApiProperty({
    description: 'Bid message from company',
    example: 'We are interested in using this content for our news segment.',
  })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({
    description: 'Bid status',
    enum: BidStatus,
    example: BidStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING,
  })
  status: BidStatus;

  @ApiProperty({
    description: 'Bid expiration date',
    example: '2025-02-01T10:15:00.000Z',
  })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({
    description: 'Payment transaction ID (when bid is accepted)',
    example: 'txn_123456789',
  })
  @Column({ nullable: true })
  paymentTransactionId: string;

  @ApiProperty({
    description: 'Payment status',
    example: false,
  })
  @Column({ default: false })
  isPaid: boolean;

  @ApiProperty({
    description: 'Bid creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-01-27T10:15:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Upload, upload => upload.bids)
  @JoinColumn({ name: 'uploadId' })
  upload: Upload;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
