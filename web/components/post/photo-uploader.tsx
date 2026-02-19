'use client';

import { useState } from 'react';
import { extractPhotoData, PhotoData } from '@/lib/exif';

interface PhotoUploaderProps {
  onPhotosSelected: (photos: PhotoData[]) => void;
}

export function PhotoUploader({ onPhotosSelected }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const photos: PhotoData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Process file for EXIF
        const photoData = await extractPhotoData(file);
        photos.push(photoData);
      }
      onPhotosSelected(photos);
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Failed to process some photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="photo-upload"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isProcessing}
      />
      <label
        htmlFor="photo-upload"
        className="cursor-pointer flex flex-col items-center justify-center gap-4"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isProcessing ? 'Processing...' : 'Click or Drag photos here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports JPG, PNG, WebP
          </p>
        </div>
      </label>
    </div>
  );
}
