'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';

export interface MatchedSpot {
  id: string;
  name_en: string;
  name_jp: string | null;
  works_name: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  area_name?: string;
}

export interface PhotoMatchResult {
  index: number;
  latitude: number;
  longitude: number;
  matchedSpot: MatchedSpot | null;
}

const MATCH_RADIUS_M = 800;

function parsePointFromEWKB(hex: string): { latitude: number; longitude: number } | null {
  if (!hex || hex.length < 42) return null;
  try {
    const buf = Buffer.from(hex, 'hex');
    const isLE = buf[0] === 1;
    const type = isLE ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
    const hasSRID = (type & 0x20000000) !== 0;
    const offset = hasSRID ? 9 : 5;
    const lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
    const lat = isLE ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function matchPhotosToSpots(
  coords: { index: number; latitude: number; longitude: number }[]
): Promise<PhotoMatchResult[]> {
  if (coords.length === 0) return [];

  const supabase = createServiceRoleClient();

  const { data: spots, error } = await supabase
    .from('spots')
    .select('*, areas ( name_en, name_jp )');

  if (error || !spots) {
    console.error('matchPhotosToSpots fetch error:', error);
    return coords.map((c) => ({
      index: c.index,
      latitude: c.latitude,
      longitude: c.longitude,
      matchedSpot: null,
    }));
  }

  const parsedSpots = spots.map((s) => {
    const point = parsePointFromEWKB(s.location);
    return {
      id: s.id as string,
      name_en: s.name_en as string,
      name_jp: s.name_jp as string | null,
      works_name: s.works_name as string,
      latitude: point?.latitude ?? 0,
      longitude: point?.longitude ?? 0,
      area_name: (s.areas as { name_jp: string | null; name_en: string } | null)?.name_jp ??
                 (s.areas as { name_jp: string | null; name_en: string } | null)?.name_en,
    };
  });

  return coords.map((coord) => {
    let nearest: (typeof parsedSpots)[number] | null = null;
    let minDist = Infinity;

    for (const spot of parsedSpots) {
      const dist = haversineDistance(
        coord.latitude, coord.longitude,
        spot.latitude, spot.longitude,
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = spot;
      }
    }

    const matched: MatchedSpot | null =
      nearest && minDist <= MATCH_RADIUS_M
        ? {
            id: nearest.id,
            name_en: nearest.name_en,
            name_jp: nearest.name_jp,
            works_name: nearest.works_name,
            latitude: nearest.latitude,
            longitude: nearest.longitude,
            distance_m: Math.round(minDist),
            area_name: nearest.area_name,
          }
        : null;

    return {
      index: coord.index,
      latitude: coord.latitude,
      longitude: coord.longitude,
      matchedSpot: matched,
    };
  });
}
