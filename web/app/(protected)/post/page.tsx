'use client';

import { useState } from 'react';
import { PhotoUploader } from '@/components/post/photo-uploader';
import { RouteEditor } from '@/components/post/route-editor';
import { PhotoData } from '@/lib/exif';

export default function PostPage() {
  const [step, setStep] = useState<'upload' | 'edit'>('upload');
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([]);

  const handlePhotosSelected = (photos: PhotoData[]) => {
    setSelectedPhotos(photos);
    setStep('edit');
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold mb-6 text-center">New Route</h1>
      
      {step === 'upload' ? (
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            Select photos to automatically generate your route timeline.
            <br />
            We&apos;ll extract location and time from your photos.
          </p>
          <PhotoUploader onPhotosSelected={handlePhotosSelected} />
        </div>
      ) : (
        <RouteEditor initialPhotos={selectedPhotos} />
      )}
    </div>
  );
}
