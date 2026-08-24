'use client';

import React, { useState } from 'react';
import { uploadImage } from '../lib/api';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  folder = 'auralic_jewels',
  className = '',
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const res = await uploadImage(file, folder);
      if (res.success && res.data?.url) {
        onUploadSuccess(res.data.url);
      } else {
        setError(res.error || 'Failed to upload image.');
        setPreview(null);
      }
    } catch (err: any) {
      setError(err.message || 'Upload connection error.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative border border-dashed border-neutral-700 bg-[#141416] p-4 text-center ${className}`}>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Upload preview" className="max-h-36 mx-auto object-cover border border-[#D4AF37]/30" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors" />
          )}
          <span className="text-xs font-serif text-neutral-300">
            {uploading ? 'Transmitting to Cloudinary...' : 'Click to Upload High-Res Photograph'}
          </span>
          <span className="text-[10px] text-neutral-500 font-sans">PNG, JPG, WEBP up to 10MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
};
