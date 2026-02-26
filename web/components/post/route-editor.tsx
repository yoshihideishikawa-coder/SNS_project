'use client';

import { useState } from 'react';
import { PhotoData } from '@/lib/exif';
import Image from 'next/image';
import { createRoute } from '@/lib/actions/route';
import { useRouter } from 'next/navigation';

interface RouteEditorProps {
  initialPhotos: PhotoData[];
}

export function RouteEditor({ initialPhotos }: RouteEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos] = useState(initialPhotos);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const sortedPhotos = [...photos].sort((a, b) => {
    return (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
  });

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
        formData.append(`meta[${index}]`, JSON.stringify({
          latitude: photo.latitude,
          longitude: photo.longitude,
          visitedAt: photo.date?.toISOString(),
          orderIndex: index
        }));
      });

      const result = await createRoute(formData);
      
      if (result.success) {
        router.push(`/routes/${result.data.id}`);
      } else {
        setErrorMessage(result.error ?? 'Failed to create route.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`An error occurred: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Route Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
            placeholder="e.g., Akihabara Night Walk"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
            placeholder="Describe your journey..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
        <div className="space-y-6">
          {sortedPhotos.map((photo, index) => (
            <div key={index} className="flex gap-4 items-start border-b pb-4 last:border-0">
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={photo.previewUrl}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Step {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {photo.date?.toLocaleString()}
                  </span>
                </div>
                {typeof photo.latitude === 'number' && typeof photo.longitude === 'number' ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    📍 Location found ({Number(photo.latitude).toFixed(4)}, {Number(photo.longitude).toFixed(4)})
                  </p>
                ) : (
                  <p className="text-xs text-orange-500 flex items-center gap-1">
                    ⚠️ No location data found
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Add a comment for this spot..."
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-1 border"
                  name={`comment-${index}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Route...' : 'Create Route'}
        </button>
      </div>
    </form>
  );
}
