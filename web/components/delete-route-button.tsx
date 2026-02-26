'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRoute } from '@/lib/actions/route';

interface DeleteRouteButtonProps {
  routeId: string;
}

export default function DeleteRouteButton({ routeId }: DeleteRouteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteRoute(routeId);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error ?? '削除に失敗しました');
        setShowConfirm(false);
      }
    });
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          削除
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">本当に削除しますか？この操作は取り消せません。</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? '削除中...' : '削除する'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  );
}
