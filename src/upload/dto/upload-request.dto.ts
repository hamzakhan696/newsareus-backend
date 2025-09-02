import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsNumberString } from 'class-validator';

export class UploadRequestDto {
  @ApiProperty({
    description: 'Title of the upload (max 100 characters)',
    example: 'My Amazing Video',
    maxLength: 100,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Description of the upload (max 500 characters)',
    example: 'This is a beautiful video showcasing amazing content',
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @ApiProperty({
    description: 'User ID (required) - can be string or number',
    example: 1,
    required: true,
  })
  @IsNumberString({}, { message: 'User ID must be a valid number string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string | number;
}
