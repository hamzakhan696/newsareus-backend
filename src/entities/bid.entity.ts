import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Upload } from './upload.entity';

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bidType: string;

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING
  })
  status: BidStatus;

  @Column({ type: 'int', nullable: false })
  companyId: number;

  @Column({ type: 'int', nullable: false })
  uploadId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Upload, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploadId' })
  upload: Upload;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
