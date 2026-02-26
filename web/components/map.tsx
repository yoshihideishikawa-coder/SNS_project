'use client';

import { useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, Marker } from '@vis.gl/react-google-maps';

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
  mapRef,
}: {
  path: Location[];
  mapRef: React.MutableRefObject<google.maps.Map | null>;
}) {
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || path.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#BC002D',
      strokeOpacity: 0.85,
      strokeWeight: 3,
      map,
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [mapRef, path]);

  return null;
}

function AutoFitBounds({
  locations,
  mapRef,
}: {
  locations: Location[];
  mapRef: React.MutableRefObject<google.maps.Map | null>;
}) {
  const fitted = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || locations.length < 2 || fitted.current) return;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => bounds.extend(loc));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    fitted.current = true;
  }, [mapRef, locations]);

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
  const mapCenter = center || (locations.length > 0 ? locations[0] : { lat: 35.6895, lng: 139.6917 });
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const onTilesLoaded = useCallback((ev: { map: google.maps.Map }) => {
    if (!mapRef.current) {
      mapRef.current = ev.map;
    }
  }, []);

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
          onTilesLoaded={onTilesLoaded}
        >
          {showRoute && locations.length >= 2 && (
            <>
              <RoutePolyline path={locations} mapRef={mapRef} />
              <AutoFitBounds locations={locations} mapRef={mapRef} />
            </>
          )}

          {locations.map((loc, index) =>
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
