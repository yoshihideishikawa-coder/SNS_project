'use client';

import { useState } from 'react';
import { extractPhotoData, PhotoData } from '@/lib/exif';
import { matchPhotosToSpots } from '@/lib/actions/spot-match';
import { Upload, MapPin, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PhotoUploaderProps {
  onPhotosReady: (photos: PhotoData[]) => void;
}

type ProcessingStep = 'idle' | 'reading' | 'matching' | 'done';

export function PhotoUploader({ onPhotosReady }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [matchStats, setMatchStats] = useState({ total: 0, withGps: 0, matched: 0 });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setProcessingStep('reading');
    const extracted: PhotoData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const photoData = await extractPhotoData(file);
        extracted.push(photoData);
      }

      setPhotos(extracted);

      const coordsToMatch = extracted
        .map((p, i) => ({ index: i, latitude: p.latitude!, longitude: p.longitude! }))
        .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number'
                       && !isNaN(c.latitude) && !isNaN(c.longitude));

      setProcessingStep('matching');

      if (coordsToMatch.length > 0) {
        const results = await matchPhotosToSpots(coordsToMatch);

        for (const result of results) {
          if (extracted[result.index]) {
            extracted[result.index].matchedSpot = result.matchedSpot;
          }
        }
      }

      const withGps = extracted.filter((p) => typeof p.latitude === 'number').length;
      const matched = extracted.filter((p) => p.matchedSpot).length;
      setMatchStats({ total: extracted.length, withGps, matched });
      setPhotos([...extracted]);
      setProcessingStep('done');
    } catch (error) {
      console.error('Error processing photos:', error);
      setProcessingStep('idle');
    }
  };

  const handleProceed = () => {
    onPhotosReady(photos);
  };

  return (
    <div className="space-y-5">
      {/* Upload Area */}
      {processingStep === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isDragging
              ? 'border-japan-red bg-japan-red/5 scale-[1.01]'
              : 'border-gray-300 hover:border-japan-red/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="photo-upload"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload size={28} className="text-gray-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                写真をドラッグ＆ドロップ
              </p>
              <p className="text-sm text-gray-500 mt-1">
                またはタップして選択 (JPG, PNG, HEIC)
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-gray-50 rounded-lg">
              <MapPin size={14} className="text-japan-red" />
              <span className="text-xs text-gray-600">
                位置情報付き写真を使うと自動でルートを生成します
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Processing State */}
      {(processingStep === 'reading' || processingStep === 'matching') && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={36} className="text-japan-red animate-spin" />
          <div className="text-center">
            <p className="text-base font-semibold text-gray-900">
              {processingStep === 'reading' ? '写真を解析中...' : '聖地DBと照合中...'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {processingStep === 'reading'
                ? 'EXIF情報（位置・日時）を抽出しています'
                : '近くの聖地スポットを検索しています'}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {processingStep === 'done' && (
        <div className="space-y-4">
          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  解析完了！
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-green-700 dark:text-green-400">
                  <span>{matchStats.total} 枚の写真</span>
                  <span>{matchStats.withGps} 枚に位置情報</span>
                  <span className="font-semibold">
                    {matchStats.matched} 件の聖地がマッチ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Thumbnails with Match Info */}
          <div className="space-y-2">
            {[...photos]
              .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))
              .map((photo, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                    photo.matchedSpot
                      ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-gray-200 bg-white dark:bg-gray-900'
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={photo.previewUrl}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {photo.matchedSpot ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {photo.matchedSpot.name_jp ?? photo.matchedSpot.name_en}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium truncate">
                            {photo.matchedSpot.works_name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {photo.matchedSpot.distance_m}m
                          </span>
                        </div>
                      </>
                    ) : typeof photo.latitude === 'number' ? (
                      <>
                        <p className="text-sm text-gray-600">GPS あり（聖地圏外）</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {photo.latitude.toFixed(4)}, {photo.longitude?.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <ImageIcon size={12} />
                        位置情報なし
                      </p>
                    )}
                  </div>
                  {photo.date && (
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {photo.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setProcessingStep('idle'); setPhotos([]); }}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              やり直す
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-japan-red rounded-xl hover:bg-japan-red-hover transition-colors"
            >
              ルートを作成 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
