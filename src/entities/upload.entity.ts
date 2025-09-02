import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('uploads')
export class Upload {
  @ApiProperty({
    description: 'Upload ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who uploaded the file',
    example: 5,
    required: false,
  })
  @Column({ nullable: true })
  userId?: number;

  @ApiProperty({
    description: 'Title of the upload (max 100 characters)',
    example: 'My Amazing Video',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @ApiProperty({
    description: 'Description of the upload (max 500 characters)',
    example: 'This is a beautiful video showcasing amazing content',
    maxLength: 500,
  })
  @Column({ type: 'text', nullable: false })
  description: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'mypic.png',
  })
  @Column()
  filename: string;

  @ApiProperty({
    description: 'Cloudinary URL of the uploaded file',
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/mypic.png',
  })
  @Column()
  fileUrl: string;

  @ApiProperty({
    description: 'Type of file (image or video)',
    enum: FileType,
    example: FileType.IMAGE,
  })
  @Column({
    type: 'enum',
    enum: FileType,
  })
  fileType: FileType;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  @Column({ nullable: true })
  fileSize: number;

  @ApiProperty({
    description: 'Cloudinary public ID',
    example: 'uploads/mypic',
    required: false,
  })
  @Column({ nullable: true })
  cloudinaryPublicId: string;

  @ApiProperty({
    description: 'Watermarked preview URL (for companies to see)',
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/watermarked_preview.png',
  })
  @Column({ nullable: true })
  watermarkedPreviewUrl: string;

  @ApiProperty({
    description: 'Whether this upload is available for bidding',
    example: true,
  })
  @Column({ default: true })
  isAvailableForBidding: boolean;

  @ApiProperty({
    description: 'Upload creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.uploads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany('Bid', 'upload')
  bids: any[];
}
