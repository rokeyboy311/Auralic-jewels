'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, AlertCircle, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  helperText?: string;
  value?: string | string[];
  onChange: (value: string) => void;
  onMultipleChange?: (values: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  required?: boolean;
}

export default function ImageUploader({
  label = 'Upload Image',
  helperText = 'Upload high-resolution image (JPG, PNG, WEBP up to 15MB)',
  value,
  onChange,
  onMultipleChange,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 15,
  accept = 'image/jpeg,image/png,image/webp,image/avif,image/gif',
  className = '',
  required = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for uniform handling
  const imageList: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === 'string' && value.trim()
    ? [value.trim()]
    : [];

  const handleFileProcess = (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files (JPG, PNG, WEBP, GIF) are supported.');
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`Image exceeds maximum size limit of ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (!multiple) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange(result);
        }
      };
      reader.readAsDataURL(validFiles[0]);
    } else {
      const newImages = [...imageList];
      let processed = 0;

      validFiles.forEach((file) => {
        if (newImages.length >= maxFiles) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && !newImages.includes(result)) {
            newImages.push(result);
          }
          processed++;
          if (processed === validFiles.length) {
            if (onMultipleChange) {
              onMultipleChange(newImages);
            }
            if (newImages.length > 0) {
              onChange(newImages[0]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files);
    }
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!multiple) {
      onChange('');
    } else {
      const updated = imageList.filter((_, idx) => idx !== indexToRemove);
      if (onMultipleChange) {
        onMultipleChange(updated);
      }
      onChange(updated[0] || '');
    }
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (!multiple || indexToPrimary === 0) return;
    const target = imageList[indexToPrimary];
    const updated = [target, ...imageList.filter((_, idx) => idx !== indexToPrimary)];
    if (onMultipleChange) {
      onMultipleChange(updated);
    }
    onChange(updated[0]);
  };

  const handleApplyUrl = () => {
    if (!manualUrl.trim()) return;
    if (!multiple) {
      onChange(manualUrl.trim());
    } else {
      const updated = [...imageList, manualUrl.trim()];
      if (onMultipleChange) {
        onMultipleChange(updated);
      }
      onChange(updated[0]);
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium">
          {label} {required && <span className="text-amber-700">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-[#9b7e46] hover:text-[#141210] uppercase tracking-wider transition-colors flex items-center gap-1 font-mono"
        >
          <LinkIcon className="w-2.5 h-2.5" />
          <span>{showUrlInput ? 'Back to File Upload' : 'Paste URL instead'}</span>
        </button>
      </div>

      {/* Manual URL Input Option (Optional switch) */}
      {showUrlInput ? (
        <div className="p-3 bg-[#faf8f5] border border-[#ebdccd] space-y-2 animate-in fade-in duration-200">
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!manualUrl.trim()}
              className="px-4 py-2 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-wider font-medium hover:bg-[#9b7e46] transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
          <p className="text-[10px] text-[#73685a]">
            Enter a direct image link from Unsplash, Cloudinary, or web server.
          </p>
        </div>
      ) : (
        /* Direct Drag & Drop / File Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#9b7e46] bg-[#f9f5ee] scale-[1.01]'
              : 'border-[#c5b49e]/80 hover:border-[#9b7e46] bg-[#faf8f5] hover:bg-[#f6f0e6]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-[#141210] text-[#d4af37] flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>

            <div>
              <p className="text-xs font-medium text-[#141210]">
                Click to browse or drop {multiple ? 'photos' : 'photo'} here
              </p>
              <p className="text-[10px] text-[#73685a] mt-0.5">{helperText}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#ebdccd] text-[9px] uppercase tracking-wider text-[#9b7e46] font-mono">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Direct Device Image Upload</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Preview Grid */}
      {imageList.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#73685a] flex justify-between items-center">
            <span>
              Attached {multiple ? `Images (${imageList.length}/${maxFiles})` : 'Image'}
            </span>
            {imageList.length > 0 && (
              <span className="text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </span>
            )}
          </div>

          <div className={`grid gap-3 ${multiple ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1'}`}>
            {imageList.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group aspect-square bg-[#f0e9df] border border-[#ebdccd] overflow-hidden shadow-xs"
              >
                <Image
                  src={imgUrl}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  unoptimized={imgUrl.startsWith('data:')}
                />

                {/* Primary Cover Badge */}
                {idx === 0 && multiple && (
                  <span className="absolute top-1.5 left-1.5 bg-[#141210] text-[#d4af37] text-[8px] uppercase tracking-widest px-1.5 py-0.5 font-mono shadow-xs">
                    Cover
                  </span>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {multiple && idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      className="p-1.5 bg-white text-[#141210] hover:bg-[#d4af37] text-[9px] uppercase tracking-wider font-mono shadow-md"
                      title="Set as primary cover image"
                    >
                      Make Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
