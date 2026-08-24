import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '../config';

// Configure Cloudinary SDK
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export class CloudinaryService {
  /**
   * Stream upload image buffer directly to Cloudinary
   */
  static async uploadBuffer(
    buffer: Buffer,
    folder: string = 'auralic_jewels'
  ): Promise<{ url: string; publicId: string; format: string; bytes: number }> {
    if (!config.cloudinary.apiKey) {
      console.warn('[CloudinaryService] Cloudinary credentials missing. Returning base64 placeholder.');
      return {
        url: `data:image/jpeg;base64,${buffer.toString('base64')}`,
        publicId: `mock_${Date.now()}`,
        format: 'jpeg',
        bytes: buffer.length,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:best', fetch_format: 'auto' },
            { flags: 'preserve_transparency' },
          ],
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('[CloudinaryService] Upload error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary upload returned empty response'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete image asset by publicId
   */
  static async deleteAsset(publicId: string): Promise<boolean> {
    if (!config.cloudinary.apiKey) return true;
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (err: any) {
      console.error('[CloudinaryService] Destroy error:', err.message);
      return false;
    }
  }
}
