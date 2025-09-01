import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum CompanyType {
  PRESS = 'press',
  MEDIA = 'media',
  NEWS_AGENCY = 'news_agency',
  BROADCAST = 'broadcast',
  DIGITAL_MEDIA = 'digital_media',
  OTHER = 'other',
}

@Entity('companies')
export class Company {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Company name',
    example: 'ABC News Network',
  })
  @Column({ unique: true })
  companyName: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@abcnews.com',
  })
  @Column({ unique: true })
  companyEmail: string;

  @ApiProperty({
    description: 'Hashed password',
    example: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+12345678901',
  })
  @Column({ unique: true })
  phoneNumber: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Media Street, New York, NY 10001',
  })
  @Column({ type: 'text' })
  companyAddress: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://www.abcnews.com',
  })
  @Column({ nullable: true })
  companyWebsite: string;

  @ApiProperty({
    description: 'Business license number',
    example: 'BL-2024-001234',
  })
  @Column({ unique: true })
  businessLicense: string;

  @ApiProperty({
    description: 'Company type',
    enum: CompanyType,
    example: CompanyType.PRESS,
  })
  @Column({
    type: 'enum',
    enum: CompanyType,
    default: CompanyType.OTHER,
  })
  companyType: CompanyType;

  @ApiProperty({
    description: 'Company verification status',
    example: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({
    description: 'Company account status',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Account creation date',
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
}
