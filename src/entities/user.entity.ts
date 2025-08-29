import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Upload } from './upload.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+12345678901',
  })
  @Column({ unique: true, nullable: true, length: 20 })
  phoneNumber: string;

  @ApiProperty({
    description: 'Hashed password',
    example: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Account creation date',
    example: '2025-01-27T10:15:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Upload, (upload) => upload.user)
  uploads: Upload[];
}
