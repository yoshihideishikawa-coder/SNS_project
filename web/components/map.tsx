'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, Marker, useMap } from '@vis.gl/react-google-maps';

interface Location {
  lat: number;
  lng: number;
}

interface MapProps {
  locations: Location[];
  center?: Location;
  zoom?: number;
  showRoute?: boolean;
  height?: string;
  labels?: string[];
}

function RoutePolyline({
  path,
}: {
  path: Location[];
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#BC002D',
      strokeOpacity: 1,
      strokeWeight: 5,
      zIndex: 1000,
      map,
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path]);

  return null;
}

function AutoFitBounds({
  locations,
}: {
  locations: Location[];
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!map || locations.length < 2 || fitted.current) return;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => bounds.extend(loc));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    fitted.current = true;
  }, [map, locations]);

  return null;
}

export default function GoogleMapComponent({
  locations,
  center,
  zoom = 12,
  showRoute = false,
  height = '400px',
  labels,
}: MapProps) {
  const validLocations = locations.filter(
    (loc) =>
      Number.isFinite(loc.lat) &&
      Number.isFinite(loc.lng) &&
      !(loc.lat === 0 && loc.lng === 0)
  );
  const mapCenter =
    center ||
    (validLocations.length > 0 ? validLocations[0] : { lat: 35.6895, lng: 139.6917 });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className={`w-full bg-gray-200 flex items-center justify-center rounded-lg`} style={{ height }}>
        <p className="text-gray-500">Google Maps API Key が設定されていません。</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full rounded-lg overflow-hidden shadow-md" style={{ height }}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          {...(mapId ? { mapId } : {})}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          {showRoute && validLocations.length >= 2 && (
            <>
              <RoutePolyline path={validLocations} />
              <AutoFitBounds locations={validLocations} />
            </>
          )}

          {validLocations.map((loc, index) =>
            mapId ? (
              <AdvancedMarker key={index} position={loc}>
                <Pin background={'#BC002D'} glyphColor={'#fff'} borderColor={'#8B0000'} />
              </AdvancedMarker>
            ) : (
              <Marker
                key={index}
                position={loc}
                label={
                  labels || showRoute
                    ? {
                        text: labels?.[index] ?? String(index + 1),
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }
                    : undefined
                }
              />
            )
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
