import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class WatermarkService {
  constructor() {
    // Cloudinary is already configured in cloudinary.service.ts
  }

  /**
   * Create a watermarked preview of an image
   * @param originalUrl - Original image URL
   * @param watermarkText - Text to overlay as watermark
   * @returns Watermarked image URL
   */
  async createWatermarkedImagePreview(originalUrl: string, watermarkText: string = 'PREVIEW ONLY'): Promise<string> {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(originalUrl);
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Create watermarked version with transformations
      const watermarkedUrl = cloudinary.url(publicId, {
        transformation: [
          // Add watermark overlay
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              font_weight: 'bold',
              text: watermarkText,
            },
            color: 'white',
            gravity: 'center',
            y: 0,
            x: 0,
          },
          // Add semi-transparent background for watermark
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              font_weight: 'bold',
              text: watermarkText,
            },
            color: 'black',
            gravity: 'center',
            y: 2,
            x: 2,
            opacity: 30,
          },
          // Add "PREVIEW" text in corner
          {
            overlay: {
              font_family: 'Arial',
              font_size: 20,
              font_weight: 'bold',
              text: 'PREVIEW',
            },
            color: 'red',
            gravity: 'north_east',
            y: 20,
            x: 20,
          },
        ],
        format: 'auto',
        quality: 'auto',
      });

      return watermarkedUrl;
    } catch (error) {
      console.error('Error creating watermarked image:', error);
      throw new Error('Failed to create watermarked preview');
    }
  }

  /**
   * Create a watermarked preview of a video (first 10 seconds)
   * @param originalUrl - Original video URL
   * @param watermarkText - Text to overlay as watermark
   * @returns Watermarked video preview URL
   */
  async createWatermarkedVideoPreview(originalUrl: string, watermarkText: string = 'PREVIEW ONLY'): Promise<string> {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(originalUrl);
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Create watermarked video preview (first 10 seconds)
      const watermarkedUrl = cloudinary.url(publicId, {
        transformation: [
          // Limit to first 10 seconds
          { duration: 10 },
          // Add watermark overlay
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              font_weight: 'bold',
              text: watermarkText,
            },
            color: 'white',
            gravity: 'center',
            y: 0,
            x: 0,
          },
          // Add semi-transparent background for watermark
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              font_weight: 'bold',
              text: watermarkText,
            },
            color: 'black',
            gravity: 'center',
            y: 2,
            x: 2,
            opacity: 30,
          },
          // Add "PREVIEW" text in corner
          {
            overlay: {
              font_family: 'Arial',
              font_size: 20,
              font_weight: 'bold',
              text: 'PREVIEW',
            },
            color: 'red',
            gravity: 'north_east',
            y: 20,
            x: 20,
          },
        ],
        format: 'mp4',
        quality: 'auto',
      });

      return watermarkedUrl;
    } catch (error) {
      console.error('Error creating watermarked video:', error);
      throw new Error('Failed to create watermarked video preview');
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns Public ID or null if invalid
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
        return null;
      }

      // Get the part after 'upload' and before the file extension
      const publicIdWithVersion = urlParts[uploadIndex + 1];
      const publicId = publicIdWithVersion.split('.')[0];
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Create watermarked preview for any file type
   * @param originalUrl - Original file URL
   * @param fileType - Type of file (image or video)
   * @param watermarkText - Text to overlay as watermark
   * @returns Watermarked preview URL
   */
  async createWatermarkedPreview(
    originalUrl: string, 
    fileType: 'image' | 'video', 
    watermarkText: string = 'PREVIEW ONLY'
  ): Promise<string> {
    if (fileType === 'image') {
      return this.createWatermarkedImagePreview(originalUrl, watermarkText);
    } else {
      return this.createWatermarkedVideoPreview(originalUrl, watermarkText);
    }
  }
}
