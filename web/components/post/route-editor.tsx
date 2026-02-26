'use client';

import { useState, useMemo } from 'react';
import { PhotoData } from '@/lib/exif';
import Image from 'next/image';
import { createRoute } from '@/lib/actions/route';
import { useRouter } from 'next/navigation';
import RouteMapPreview from '@/components/post/route-map-preview';
import { MapPin, Clock, Film, Navigation, Sparkles } from 'lucide-react';

interface RouteEditorProps {
  initialPhotos: PhotoData[];
}

export function RouteEditor({ initialPhotos }: RouteEditorProps) {
  const router = useRouter();

  const sortedPhotos = useMemo(
    () => [...initialPhotos].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0)),
    [initialPhotos]
  );

  const matchedSpots = useMemo(
    () => sortedPhotos.filter((p) => p.matchedSpot),
    [sortedPhotos]
  );

  const uniqueWorks = useMemo(() => {
    const works = new Set(matchedSpots.map((p) => p.matchedSpot!.works_name));
    return Array.from(works);
  }, [matchedSpots]);

  const suggestedTitle = useMemo(() => {
    if (matchedSpots.length === 0) return '';
    const spotNames = matchedSpots
      .slice(0, 3)
      .map((p) => p.matchedSpot!.name_jp ?? p.matchedSpot!.name_en);
    const names = spotNames.join(' → ');
    if (uniqueWorks.length === 1) return `${uniqueWorks[0]} 聖地巡礼: ${names}`;
    return names;
  }, [matchedSpots, uniqueWorks]);

  const routeLocations = useMemo(
    () =>
      sortedPhotos
        .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
        .map((p) => ({ lat: p.latitude!, lng: p.longitude! })),
    [sortedPhotos]
  );

  const [title, setTitle] = useState(suggestedTitle);
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setComment = (index: number, value: string) =>
    setComments((prev) => ({ ...prev, [index]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      sortedPhotos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo.file);
        formData.append(
          `meta[${index}]`,
          JSON.stringify({
            latitude: photo.latitude,
            longitude: photo.longitude,
            visitedAt: photo.date?.toISOString(),
            orderIndex: index,
            spotId: photo.matchedSpot?.id ?? null,
            comment: comments[index] ?? null,
          })
        );
      });

      const result = await createRoute(formData);

      if (result.success) {
        router.push(`/routes/${result.data.id}`);
      } else {
        setErrorMessage(result.error ?? 'Failed to create route.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Route Map Preview */}
      {routeLocations.length > 0 && (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <RouteMapPreview
            locations={routeLocations}
            matchedSpots={sortedPhotos.map((p) => p.matchedSpot ?? null)}
          />
        </div>
      )}

      {/* Match Summary */}
      {matchedSpots.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/15 dark:to-pink-900/15 border border-purple-200 dark:border-purple-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={15} className="text-purple-600" />
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              自動生成されたルート
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSpots.map((p, i) => (
              <span key={i} className="flex items-center gap-1 text-xs">
                <span className="w-4 h-4 bg-japan-red text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {p.matchedSpot!.name_jp ?? p.matchedSpot!.name_en}
                </span>
                {i < matchedSpots.length - 1 && (
                  <Navigation size={10} className="text-gray-400 mx-0.5" />
                )}
              </span>
            ))}
          </div>
          {uniqueWorks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {uniqueWorks.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium"
                >
                  <Film size={9} />
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title & Description */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            ルートタイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. 秋葉原→神田明神 聖地巡礼"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            説明（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="巡礼の感想やおすすめポイント..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
          タイムライン ({sortedPhotos.length} 枚)
        </h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-4">
            {sortedPhotos.map((photo, index) => (
              <div key={index} className="flex gap-3 relative">
                {/* Marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white dark:ring-gray-900 shadow-sm">
                    <Image
                      src={photo.previewUrl}
                      alt={`Step ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-6 h-6 bg-japan-red text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {photo.matchedSpot ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin size={13} className="text-japan-red shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {photo.matchedSpot.name_jp ?? photo.matchedSpot.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded font-medium">
                          {photo.matchedSpot.works_name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          約{photo.matchedSpot.distance_m}m圏内
                        </span>
                        {photo.date && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                            <Clock size={9} />
                            {photo.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={comments[index] ?? ''}
                        onChange={(e) => setComment(index, e.target.value)}
                        placeholder="コメントを追加..."
                        className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                      {typeof photo.latitude === 'number' ? (
                        <p className="text-xs text-gray-500">
                          📍 {photo.latitude.toFixed(4)}, {photo.longitude?.toFixed(4)}
                          <span className="ml-2 text-gray-400">（聖地DB圏外）</span>
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">位置情報なし</p>
                      )}
                      <input
                        type="text"
                        value={comments[index] ?? ''}
                        onChange={(e) => setComment(index, e.target.value)}
                        placeholder="コメントを追加..."
                        className="w-full mt-2 px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-900 focus:ring-1 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !title}
        className="w-full py-3 text-sm font-semibold text-white bg-japan-red rounded-xl hover:bg-japan-red-hover disabled:opacity-50 transition-colors shadow-sm"
      >
        {isSubmitting ? 'ルートを作成中...' : 'ルートを投稿する'}
      </button>
    </form>
  );
}
