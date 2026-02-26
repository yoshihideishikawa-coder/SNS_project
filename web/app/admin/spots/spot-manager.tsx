"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  MapPin,
  Film,
  ChevronDown,
} from "lucide-react";
import {
  type SpotRow,
  type AreaRow,
  createSpot,
  updateSpot,
  deleteSpot,
} from "@/lib/actions/spots";

interface SpotManagerProps {
  initialSpots: SpotRow[];
  areas: AreaRow[];
}

interface SpotFormData {
  name_en: string;
  name_jp: string;
  description: string;
  works_name: string;
  address: string;
  image_url: string;
  area_id: string;
  latitude: string;
  longitude: string;
}

const emptyForm: SpotFormData = {
  name_en: "",
  name_jp: "",
  description: "",
  works_name: "",
  address: "",
  image_url: "",
  area_id: "",
  latitude: "",
  longitude: "",
};

function SpotForm({
  initial,
  areas,
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}: {
  initial: SpotFormData;
  areas: AreaRow[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<SpotFormData>(initial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    onSubmit(fd);
  };

  const set = (key: keyof SpotFormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            スポット名 (英語) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) => set("name_en", e.target.value)}
            required
            placeholder="e.g. Kanda Myojin Shrine"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            スポット名 (日本語)
          </label>
          <input
            type="text"
            value={form.name_jp}
            onChange={(e) => set("name_jp", e.target.value)}
            placeholder="e.g. 神田明神"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          作品名 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Film
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={form.works_name}
            onChange={(e) => set("works_name", e.target.value)}
            required
            placeholder="e.g. Love Live!, Your Name"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          説明
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="スポットの説明やシーンの詳細..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            緯度 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            required
            placeholder="e.g. 35.7020"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            経度 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            required
            placeholder="e.g. 139.7679"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            住所
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="e.g. 東京都千代田区外神田2-16-2"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            エリア
          </label>
          <div className="relative">
            <select
              value={form.area_id}
              onChange={(e) => set("area_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors appearance-none"
            >
              <option value="">-- 未指定 --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name_jp ?? a.name_en}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          画像URL
        </label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => set("image_url", e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium text-white bg-japan-red rounded-lg hover:bg-japan-red-hover disabled:opacity-50 transition-colors"
        >
          {isPending
            ? isEdit
              ? "更新中..."
              : "登録中..."
            : isEdit
              ? "更新する"
              : "登録する"}
        </button>
      </div>
    </form>
  );
}

export default function SpotManager({ initialSpots, areas }: SpotManagerProps) {
  const [spots, setSpots] = useState(initialSpots);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<SpotRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredSpots = useMemo(() => {
    let result = spots;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name_en.toLowerCase().includes(q) ||
          s.name_jp?.toLowerCase().includes(q) ||
          s.works_name.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q)
      );
    }
    if (filterAreaId) {
      result = result.filter((s) => s.area_id === filterAreaId);
    }
    return result;
  }, [spots, searchQuery, filterAreaId]);

  const handleCreate = (fd: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createSpot(fd);
      if (result.success) {
        setShowForm(false);
        const { getSpots } = await import("@/lib/actions/spots");
        const updated = await getSpots();
        setSpots(updated);
      } else {
        setError(result.error ?? "登録に失敗しました");
      }
    });
  };

  const handleUpdate = (fd: FormData) => {
    if (!editingSpot) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSpot(editingSpot.id, fd);
      if (result.success) {
        setEditingSpot(null);
        const { getSpots } = await import("@/lib/actions/spots");
        const updated = await getSpots();
        setSpots(updated);
      } else {
        setError(result.error ?? "更新に失敗しました");
      }
    });
  };

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSpot(id);
      if (result.success) {
        setDeletingId(null);
        setSpots((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(result.error ?? "削除に失敗しました");
      }
    });
  };

  const openEdit = (spot: SpotRow) => {
    setEditingSpot(spot);
    setShowForm(false);
    setError(null);
  };

  const openCreate = () => {
    setShowForm(true);
    setEditingSpot(null);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSpot(null);
    setError(null);
  };

  const spotToForm = (s: SpotRow): SpotFormData => ({
    name_en: s.name_en,
    name_jp: s.name_jp ?? "",
    description: s.description ?? "",
    works_name: s.works_name,
    address: s.address ?? "",
    image_url: s.image_url ?? "",
    area_id: s.area_id ?? "",
    latitude: s.latitude.toString(),
    longitude: s.longitude.toString(),
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="スポット名、作品名で検索..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filterAreaId}
            onChange={(e) => setFilterAreaId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red outline-none transition-colors appearance-none pr-8"
          >
            <option value="">全エリア</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_jp ?? a.name_en}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-japan-red rounded-lg hover:bg-japan-red-hover transition-colors shrink-0"
        >
          <Plus size={16} />
          新規登録
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            聖地スポットを登録
          </h3>
          <SpotForm
            initial={emptyForm}
            areas={areas}
            onSubmit={handleCreate}
            onCancel={closeForm}
            isPending={isPending}
            isEdit={false}
          />
        </div>
      )}

      {/* Edit Form */}
      {editingSpot && (
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            「{editingSpot.name_jp ?? editingSpot.name_en}」を編集
          </h3>
          <SpotForm
            initial={spotToForm(editingSpot)}
            areas={areas}
            onSubmit={handleUpdate}
            onCancel={closeForm}
            isPending={isPending}
            isEdit
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  スポット名
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  作品名
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  エリア
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  座標
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  住所
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSpots.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    <MapPin
                      size={32}
                      className="mx-auto mb-2 opacity-40"
                    />
                    <p>
                      {searchQuery || filterAreaId
                        ? "検索条件に一致するスポットがありません"
                        : "聖地スポットが登録されていません"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot) => (
                  <tr
                    key={spot.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {spot.name_en}
                        </p>
                        {spot.name_jp && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {spot.name_jp}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                        <Film size={11} />
                        {spot.works_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {spot.area ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                          {spot.area.name_jp ?? spot.area.name_en}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate block">
                        {spot.address || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(spot)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Pencil size={15} />
                        </button>
                        {deletingId === spot.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(spot.id)}
                              disabled={isPending}
                              className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {isPending ? "..." : "削除"}
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              disabled={isPending}
                              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                              戻す
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(spot.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredSpots.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            {searchQuery || filterAreaId
              ? `${filteredSpots.length} 件表示 / 全 ${spots.length} 件`
              : `全 ${spots.length} 件`}
          </div>
        )}
      </div>
    </div>
  );
}
