"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Rows3, MapPin, Heart, Camera } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Route, Area } from "@/app/lib/mock-data";

interface HomeFeedProps {
  routes: Route[];
  areas: Area[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <Camera size={32} className="text-sub-text" />
      </div>
      <p className="text-lg font-semibold text-foreground">まだ投稿がありません</p>
      <p className="text-sm text-sub-text mt-2 leading-relaxed">
        このエリアの聖地ルートを投稿して
        <br />
        みんなとシェアしよう
      </p>
      <Link
        href="/post"
        className="mt-6 px-6 py-2.5 bg-japan-red text-white text-sm font-medium rounded-full hover:bg-japan-red-hover transition-colors"
      >
        ルートを投稿する
      </Link>
    </div>
  );
}

function TimelineCard({ route, priority }: { route: Route; priority?: boolean }) {
  const spotCount = route.spots.length;

  return (
    <Link href={`/routes/${route.id}`} className="block relative w-full group">
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {route.coverPhotoUrl ? (
          <Image
            src={route.coverPhotoUrl}
            alt={route.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
            sizes="(max-width: 480px) 100vw, 480px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {spotCount > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
            <MapPin size={12} className="text-japan-red" />
            <span className="text-xs font-semibold text-white">{spotCount} spots</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          {route.spots[0]?.spot.area && (
            <span className="inline-block px-2.5 py-1 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/90 bg-japan-red/80 backdrop-blur-sm rounded">
              {route.spots[0].spot.area.nameEn}
            </span>
          )}

          <h2 className="text-xl font-bold text-white leading-tight mb-1.5 drop-shadow-sm">
            {route.title}
          </h2>

          {route.description && (
            <p className="text-sm text-white/75 line-clamp-2 mb-3 leading-relaxed">
              {route.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {route.author.avatarUrl ? (
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/30">
                  <Image
                    src={route.author.avatarUrl}
                    alt={route.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/30 ring-2 ring-white/20" />
              )}
              <span className="text-xs font-medium text-white/80">{route.author.name}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Heart
                size={16}
                className={cn(
                  "transition-colors",
                  route.isSaved ? "fill-japan-red text-japan-red" : "text-white/80"
                )}
              />
              <span className="text-xs font-medium text-white/80">{route.likes}</span>
            </div>
          </div>

          {spotCount > 1 && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/15">
              {route.spots.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/30">
                    <Image
                      src={s.photoUrl}
                      alt={`Spot ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {i < Math.min(spotCount, 5) - 1 && (
                    <div className="w-3 h-px bg-white/30 mx-0.5" />
                  )}
                </div>
              ))}
              {spotCount > 5 && (
                <span className="text-[10px] text-white/60 ml-1">+{spotCount - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function GridTile({ route, index }: { route: Route; index: number }) {
  const isWide = index % 5 === 0;
  const isTall = index % 3 === 1;

  return (
    <Link
      href={`/routes/${route.id}`}
      className={cn(
        "relative overflow-hidden group",
        isWide ? "col-span-2 aspect-[2/1]" : isTall ? "aspect-[3/5]" : "aspect-square"
      )}
    >
      {route.coverPhotoUrl ? (
        <Image
          src={route.coverPhotoUrl}
          alt={route.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes={isWide ? "(max-width: 480px) 100vw, 480px" : "(max-width: 480px) 50vw, 240px"}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-xs font-semibold text-white line-clamp-1 drop-shadow">{route.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin size={10} className="text-japan-red" />
          <span className="text-[10px] text-white/80">{route.spots.length} spots</span>
        </div>
      </div>

      {route.spots.length > 0 && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full">
          <MapPin size={9} className="text-japan-red" />
          <span className="text-[9px] font-semibold text-white">{route.spots.length}</span>
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full">
        <Heart
          size={10}
          className={cn(route.isSaved ? "fill-japan-red text-japan-red" : "text-white/80")}
        />
        <span className="text-[9px] font-medium text-white/80">{route.likes}</span>
      </div>
    </Link>
  );
}

export default function HomeFeed({ routes, areas }: HomeFeedProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const toggleView = useCallback(() => {
    setViewMode((prev) => (prev === "timeline" ? "grid" : "timeline"));
  }, []);

  const filteredRoutes = useMemo(() => {
    if (!selectedAreaId) return routes;
    return routes.filter((route) =>
      route.spots.some((rs) => rs.spot.area?.id === selectedAreaId)
    );
  }, [selectedAreaId, routes]);

  return (
    <div className="relative pb-16">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full max-w-[480px] left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Seichi<span className="text-japan-red">Route</span>
          </h1>

          <button
            onClick={toggleView}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label={viewMode === "timeline" ? "グリッド表示に切り替え" : "タイムライン表示に切り替え"}
          >
            <Rows3
              size={14}
              className={cn(
                "transition-colors",
                viewMode === "timeline" ? "text-japan-red" : "text-sub-text"
              )}
            />
            <div className="w-px h-3 bg-border" />
            <LayoutGrid
              size={14}
              className={cn(
                "transition-colors",
                viewMode === "grid" ? "text-japan-red" : "text-sub-text"
              )}
            />
          </button>
        </div>
      </header>

      {/* Area Filter */}
      <div className="fixed top-12 z-30 w-full max-w-[480px] left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedAreaId(null)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
              selectedAreaId === null
                ? "bg-japan-red text-white shadow-lg shadow-japan-red/25"
                : "bg-muted text-sub-text hover:text-foreground"
            )}
          >
            All
          </button>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                selectedAreaId === area.id
                  ? "bg-japan-red text-white shadow-lg shadow-japan-red/25"
                  : "bg-muted text-sub-text hover:text-foreground"
              )}
            >
              {area.nameJp}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-[88px]">
        {filteredRoutes.length === 0 ? (
          <EmptyState />
        ) : viewMode === "timeline" ? (
          <div className="flex flex-col gap-0.5 feed-fade-in">
            {filteredRoutes.map((route, i) => (
              <TimelineCard key={route.id} route={route} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0.5 p-0.5 feed-fade-in">
            {filteredRoutes.map((route, i) => (
              <GridTile key={route.id} route={route} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
