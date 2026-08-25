import { getDbPool } from '../db/connection';

export class MediaService {
  /**
   * Store image binary in Neon PostgreSQL database
   */
  static async uploadBuffer(
    buffer: Buffer,
    filename: string = 'jewellery_image.jpg',
    mimeType: string = 'image/jpeg',
    folder: string = 'aurelic_jewels'
  ): Promise<{ url: string; id: string; format: string; bytes: number }> {
    const pool = getDbPool();
    const base64Data = buffer.toString('base64');
    const bytes = buffer.length;
    const format = mimeType.split('/')[1] || 'jpeg';

    if (!pool) {
      throw new Error('Database pool unavailable for image storage.');
    }

    try {
      const result = await pool.query(
        `INSERT INTO media_uploads (filename, mime_type, data_base64, file_size, folder)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, filename, mime_type, file_size, created_at`,
        [filename, mimeType, base64Data, bytes, folder]
      );

      const record = result.rows[0];
      const mediaUrl = `/api/media/${record.id}`;

      return {
        url: mediaUrl,
        id: record.id,
        format,
        bytes,
      };
    } catch (err: any) {
      console.error('[MediaService] Error storing image in Neon database:', err.message);
      throw new Error('Failed to store image in database: ' + err.message);
    }
  }

  /**
   * Retrieve image buffer and MIME type from Neon PostgreSQL
   */
  static async getMediaById(id: string): Promise<{ buffer: Buffer; mimeType: string; filename: string } | null> {
    const pool = getDbPool();
    if (!pool) return null;

    try {
      const result = await pool.query(
        `SELECT filename, mime_type, data_base64 FROM media_uploads WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      const buffer = Buffer.from(row.data_base64, 'base64');
      return {
        buffer,
        mimeType: row.mime_type || 'image/jpeg',
        filename: row.filename || 'image.jpg',
      };
    } catch (err: any) {
      console.error('[MediaService] Error retrieving media from database:', err.message);
      return null;
    }
  }

  /**
   * Delete image asset from Neon PostgreSQL
   */
  static async deleteAsset(id: string): Promise<boolean> {
    const pool = getDbPool();
    if (!pool) return true;

    try {
      await pool.query('DELETE FROM media_uploads WHERE id = $1', [id]);
      return true;
    } catch (err: any) {
      console.error('[MediaService] Error deleting asset:', err.message);
      return false;
    }
  }
}
