'use client';

import React, { useState } from 'react';
import { uploadImage } from '../lib/api';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export interface ImageUploaderProps {
  onUploadSuccess?: (url: string) => void;
  onChange?: (url: string) => void;
  onMultipleChange?: (urls: string[]) => void;
  value?: string | string[];
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
  folder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onChange,
  onMultipleChange,
  value,
  multiple = false,
  maxFiles = 5,
  label = 'Haute Joaillerie Photographs',
  helperText = 'Upload high-resolution photography (JPEG, PNG, WEBP up to 10MB)',
  folder = 'auralic_jewels',
  className = '',
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const imagesList = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles : 1);
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          setError('Please upload valid image files (JPEG, PNG, WEBP, GIF).');
          continue;
        }

        if (file.size > 15 * 1024 * 1024) {
          setError('Image file must be under 15MB.');
          continue;
        }

        const res = await uploadImage(file, folder);
        if (res.success && res.data?.url) {
          uploadedUrls.push(res.data.url);
        } else {
          setError(res.error || 'Failed to upload image to atelier storage.');
        }
      }

      if (uploadedUrls.length > 0) {
        if (onUploadSuccess) {
          onUploadSuccess(uploadedUrls[0]);
        }
        if (onChange) {
          onChange(uploadedUrls[0]);
        }
        if (onMultipleChange) {
          onMultipleChange([...imagesList, ...uploadedUrls].slice(0, maxFiles));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Upload transmission error.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = imagesList.filter((_, idx) => idx !== indexToRemove);
    if (onMultipleChange) {
      onMultipleChange(updated);
    }
    if (onChange) {
      onChange(updated[0] || '');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium">
          {label}
        </label>
      )}

      {imagesList.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
          {imagesList.map((imgUrl, idx) => (\r
            <div key={idx} className="relative aspect-square bg-[#141210]/5 border border-[#c5b49e]/60 overflow-hidden">
              <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-black/80 text-white p-1 rounded-full text-xs hover:bg-rose-700 transition-colors"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(!multiple && imagesList.length >= 1) ? null : (
        <div className="border border-dashed border-[#c5b49e] bg-[#faf8f5] p-4 text-center hover:bg-[#f2ece2] transition-colors">
          <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-[#9b7e46] animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[#9b7e46]/80 hover:text-[#9b7e46] transition-colors" />
            )}
            <span className="text-xs font-serif text-[#141210]">
              {uploading ? 'Transmitting to Atelier Vault...' : 'Select Photography to Upload'}
            </span>
            <span className="text-[10px] text-[#73685a] font-sans">{helperText}</span>
            <input
              name="uploaderFile"
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileChange}
              disabled={uploading}
              aria-label="Upload jewelry photography or sketches"
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploader;
