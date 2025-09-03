import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class WatermarkService {
  constructor() {
    // Cloudinary is already configured in cloudinary.service.ts
  }

  /**
   * Create a reliable watermarked preview using eager transformations
   * @param originalUrl - Original image URL
   * @param watermarkText - Text to overlay as watermark
   * @returns Clean watermarked image URL
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

      console.log(`Creating watermarked image using eager transformation: ${publicId}`);

      // Use eager transformation to create and store the watermarked image permanently
      // This approach creates a clean URL without complex transformations
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'image',
        eager: [
          {
            transformation: [
              // Single, large watermark in center
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 450,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 60,
                angle: -45,
                gravity: 'center',
                x: 0,
                y: 0,
              },
            ],
            fetch_format: 'auto',
            quality: 'auto',
          },
        ],
        eager_async: true,
      });

      // Get the generated watermarked image URL
      const watermarkedUrl = result?.eager?.[0]?.secure_url || result?.eager?.[0]?.url;
      
      if (!watermarkedUrl) {
        throw new Error('Failed to generate watermarked image');
      }

      console.log(`Successfully created watermarked image with clean URL`);
      return watermarkedUrl;

    } catch (error) {
      console.error('Error creating watermarked image with eager transformation:', error);
      
      // Fallback to simple URL transformation if eager fails
      try {
        console.log('Falling back to simple URL transformation...');
        return this.createSimpleUrlWatermark(publicIdOrUrl, watermarkText);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('Failed to create watermarked preview');
      }
    }
  }

  /**
   * Create a reliable watermarked video preview using eager transformations
   * @param originalUrl - Original video URL
   * @param watermarkText - Text to overlay as watermark
   * @returns Clean watermarked video URL
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

      console.log(`Creating watermarked video using eager transformation: ${publicId}`);

      // Get video info to calculate half duration
      const videoInfo = await cloudinary.api.resource(publicId, { resource_type: 'video' });
      const originalDuration = videoInfo.duration || 60;
      const previewDuration = Math.floor(originalDuration / 2);

      console.log(`Video: ${publicId}, Original duration: ${originalDuration}s, Preview duration: ${previewDuration}s`);

      // Use eager transformation for video watermarking
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'video',
        eager: [
          {
            transformation: [
              { start_offset: 0, end_offset: previewDuration },
              // Single, large watermark in center
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 450,
                  font_weight: 'bold',
                  text: watermarkText,
                },
                color: 'white',
                opacity: 60,
                angle: -45,
                gravity: 'center',
                x: 0,
                y: 0,
              },
            ],
            quality: 'auto',
            format: 'mp4',
          },
        ],
        eager_async: true,
      });

      // Get the generated watermarked video URL
      const watermarkedUrl = result?.eager?.[0]?.secure_url || result?.eager?.[0]?.url;
      
      if (!watermarkedUrl) {
        throw new Error('Failed to generate watermarked video');
      }

      console.log(`Successfully created watermarked video with clean URL`);
      return watermarkedUrl;

    } catch (error) {
      console.error('Error creating watermarked video with eager transformation:', error);
      
      // Fallback to simple URL transformation if eager fails
      try {
        console.log('Falling back to simple URL transformation...');
        return this.createSimpleVideoUrlWatermark(publicIdOrUrl, watermarkText);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('Failed to create watermarked video preview');
      }
    }
  }

  /**
   * Fallback simple URL watermark for images
   */
  private createSimpleUrlWatermark(publicIdOrUrl: string, watermarkText: string): string {
    const publicId = publicIdOrUrl.includes('/upload/')
      ? this.extractPublicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl;
    
    if (!publicId) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    // Single, simple watermark - no complex transformations
    return cloudinary.url(publicId, {
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 300,
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
      ],
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  /**
   * Fallback simple URL watermark for videos
   */
  private createSimpleVideoUrlWatermark(publicIdOrUrl: string, watermarkText: string): string {
    const publicId = publicIdOrUrl.includes('/upload/')
      ? this.extractPublicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl;
    
    if (!publicId) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    // Single, simple watermark - no complex transformations
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 300,
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
      ],
      quality: 'auto',
      format: 'mp4',
    });
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
   * Create professional watermarked preview for any file type
   * @param originalUrl - Original file URL
   * @param fileType - Type of file (image or video)
   * @param watermarkText - Text to overlay as watermark
   * @returns Professional watermarked preview URL
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
