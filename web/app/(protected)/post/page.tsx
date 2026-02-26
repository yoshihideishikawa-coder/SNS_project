'use client';

import { useState } from 'react';
import { PhotoUploader } from '@/components/post/photo-uploader';
import { RouteEditor } from '@/components/post/route-editor';
import { PhotoData } from '@/lib/exif';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostPage() {
  const [step, setStep] = useState<'upload' | 'edit'>('upload');
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([]);

  const handlePhotosReady = (photos: PhotoData[]) => {
    setSelectedPhotos(photos);
    setStep('edit');
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-5">
        {step === 'edit' ? (
          <button
            onClick={() => setStep('upload')}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link href="/" className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {step === 'upload' ? '写真をアップロード' : 'ルートを確認'}
          </h1>
          <p className="text-xs text-gray-500">
            {step === 'upload'
              ? '位置情報付きの写真から自動でルートを生成します'
              : '聖地DBと照合した結果を確認してください'}
          </p>
        </div>
      </div>

      {step === 'upload' ? (
        <PhotoUploader onPhotosReady={handlePhotosReady} />
      ) : (
        <RouteEditor initialPhotos={selectedPhotos} />
      )}
    </div>
  );
}
