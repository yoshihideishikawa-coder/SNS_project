'use client';

import { useMemo } from 'react';
import GoogleMapComponent from '@/components/map';
import type { MatchedSpotInfo } from '@/lib/exif';

interface Location {
  lat: number;
  lng: number;
}

interface RouteMapPreviewProps {
  locations: Location[];
  matchedSpots: (MatchedSpotInfo | null)[];
}

export default function RouteMapPreview({ locations, matchedSpots }: RouteMapPreviewProps) {
  const labels = useMemo(
    () =>
      locations.map((_, i) => {
        const spot = matchedSpots[i];
        return spot?.name_jp?.charAt(0) ?? spot?.name_en?.charAt(0) ?? String(i + 1);
      }),
    [locations, matchedSpots]
  );

  if (locations.length === 0) return null;

  return (
    <GoogleMapComponent
      locations={locations}
      showRoute
      height="250px"
      labels={labels}
    />
  );
}
