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
  async createWatermarkedImagePreview(publicIdOrUrl: string, watermarkText: string = 'NEWSAREUS'): Promise<string> {
    try {
      // Accept either a full URL or a raw public ID
      const publicId = publicIdOrUrl.includes('/upload/')
        ? this.extractPublicIdFromUrl(publicIdOrUrl)
        : publicIdOrUrl;
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Persist derived watermarked image using eager transformation
      const explicitResult = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'image',
        eager: [
          {
            transformation: [
              // Create multiple watermarks manually positioned across the image
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north_west',
                x: 100,
                y: 100,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north_east',
                x: -100,
                y: 100,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'center',
                x: 0,
                y: 0,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south_west',
                x: 100,
                y: -100,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south_east',
                x: -100,
                y: -100,
              },
              // Additional watermarks for better coverage
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north',
                x: 0,
                y: 150,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south',
                x: 0,
                y: -150,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'west',
                x: 150,
                y: 0,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 120,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'east',
                x: -150,
                y: 0,
              },
            ],
            fetch_format: 'auto',
            quality: 'auto',
          },
        ],
      });

      const derivedUrl = explicitResult?.eager?.[0]?.secure_url || explicitResult?.eager?.[0]?.url;
      if (!derivedUrl) {
        throw new Error('Failed to derive watermarked image');
      }
      return derivedUrl;
    } catch (error) {
      console.error('Error creating watermarked image:', error);
      throw new Error('Failed to create watermarked preview');
    }
  }

  /**
   * Create a watermarked preview of a video (half duration with watermark)
   * @param originalUrl - Original video URL
   * @param watermarkText - Text to overlay as watermark
   * @returns Watermarked video preview URL
   */
  async createWatermarkedVideoPreview(publicIdOrUrl: string, watermarkText: string = 'NEWSAREUS'): Promise<string> {
    try {
      // Accept either a full URL or a raw public ID
      const publicId = publicIdOrUrl.includes('/upload/')
        ? this.extractPublicIdFromUrl(publicIdOrUrl)
        : publicIdOrUrl;
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Get video info to calculate half duration
      const videoInfo = await cloudinary.api.resource(publicId, { resource_type: 'video' });
      const originalDuration = videoInfo.duration || 60; // Default to 60 seconds if duration not available
      const previewDuration = Math.floor(originalDuration / 2); // Half duration

      console.log(`Video: ${publicId}, Original duration: ${originalDuration}s, Preview duration: ${previewDuration}s`);

      // Persist derived watermarked video preview using eager transformation
      const explicitResult = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'video',
        eager: [
          {
            transformation: [
              { start_offset: 0, end_offset: previewDuration }, // Create preview from start to half duration
              // Create multiple watermarks manually positioned across the video
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north_west',
                x: 80,
                y: 80,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north_east',
                x: -80,
                y: 80,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'center',
                x: 0,
                y: 0,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south_west',
                x: 80,
                y: -80,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south_east',
                x: -80,
                y: -80,
              },
              // Additional watermarks for better coverage
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'north',
                x: 0,
                y: 120,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'south',
                x: 0,
                y: -120,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'west',
                x: 120,
                y: 0,
              },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 80,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 50,
                angle: -45,
                gravity: 'east',
                x: -120,
                y: 0,
              },
            ],
            quality: 'auto',
            format: 'mp4',
          },
        ],
      });

      const derivedUrl = explicitResult?.eager?.[0]?.secure_url || explicitResult?.eager?.[0]?.url;
      if (!derivedUrl) {
        throw new Error('Failed to derive watermarked video');
      }
      return derivedUrl;
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
      const uploadMarker = '/upload/';
      const uploadIndex = url.indexOf(uploadMarker);
      if (uploadIndex === -1) {
        return null;
      }

      // Take everything after '/upload/' (this may include version and folders)
      const afterUpload = url.substring(uploadIndex + uploadMarker.length).split('?')[0];

      // Strip a leading version segment such as 'v1234567890/' if present
      const withoutVersion = afterUpload.replace(/^v\d+\//, '');

      // Remove the file extension (keep folder path + public id)
      const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, '');

      return withoutExtension || null;
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
    publicIdOrUrl: string, 
    fileType: 'image' | 'video', 
    watermarkText: string = 'NEWSAREUS'
  ): Promise<string> {
    if (fileType === 'image') {
      return this.createWatermarkedImagePreview(publicIdOrUrl, watermarkText);
    } else {
      return this.createWatermarkedVideoPreview(publicIdOrUrl, watermarkText);
    }
  }
}
