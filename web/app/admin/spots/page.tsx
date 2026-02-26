import { getSpots, getAreas } from "@/lib/actions/spots";
import SpotManager from "./spot-manager";

export default async function AdminSpotsPage() {
  const [spots, areas] = await Promise.all([getSpots(), getAreas()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          聖地スポット管理
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          聖地スポットの登録・編集・削除を行います。全 {spots.length} 件
        </p>
      </div>
      <SpotManager initialSpots={spots} areas={areas} />
    </div>
  );
}
