"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List, MapPin, Heart, Search } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { MOCK_ROUTES, MOCK_AREAS } from "@/app/lib/mock-data";

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    if (!selectedAreaId) return MOCK_ROUTES;
    return MOCK_ROUTES.filter((route) =>
      route.spots.some((rs) => rs.spot.area?.id === selectedAreaId)
    );
  }, [selectedAreaId]);

  return (
    <div className="relative">
      {/* Transparent Header */}
      <header className="fixed top-0 z-40 w-full max-w-[480px] left-1/2 -translate-x-1/2 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent text-white">
        <h1 className="text-xl font-bold tracking-tight">Seichi Route</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === "timeline" ? "grid" : "timeline")}
            className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
          >
            {viewMode === "timeline" ? <LayoutGrid size={20} /> : <List size={20} />}
          </button>
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Area Filter */}
      <div className="fixed top-[52px] z-30 w-full max-w-[480px] left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedAreaId(null)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              selectedAreaId === null
                ? "bg-japan-red text-white shadow-md"
                : "bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
            )}
          >
            All
          </button>
          {MOCK_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedAreaId === area.id
                  ? "bg-japan-red text-white shadow-md"
                  : "bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
              )}
            >
              {area.nameJp}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-0">
        {viewMode === "timeline" ? (
          <div className="flex flex-col gap-1">
            {filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-sub-text">
                <MapPin size={48} className="mb-3 opacity-40" />
                <p className="text-lg font-medium">まだ投稿がありません</p>
                <p className="text-sm mt-1">このエリアの聖地ルートを投稿しよう</p>
              </div>
            ) : null}
            {filteredRoutes.map((route) => (
              <div key={route.id} className="relative w-full aspect-[4/5] group">
                <Link href={`/routes/${route.id}`} className="block w-full h-full">
                  <Image
                    src={route.coverPhotoUrl}
                    alt={route.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  
                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-200">
                      <MapPin size={14} className="text-japan-red" />
                      <span>{route.spots[0].spot.name}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1 leading-tight">{route.title}</h2>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/50">
                          <Image src={route.author.avatarUrl} alt={route.author.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs font-medium opacity-90">{route.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Heart size={18} className={cn("text-white", route.isSaved && "fill-japan-red text-japan-red")} />
                        <span>{route.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0.5">
            {filteredRoutes.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center h-[60vh] text-sub-text">
                <MapPin size={48} className="mb-3 opacity-40" />
                <p className="text-lg font-medium">まだ投稿がありません</p>
                <p className="text-sm mt-1">このエリアの聖地ルートを投稿しよう</p>
              </div>
            ) : null}
            {filteredRoutes.map((route) => (
              <Link key={route.id} href={`/routes/${route.id}`} className="relative aspect-square">
                <Image
                  src={route.coverPhotoUrl}
                  alt={route.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
