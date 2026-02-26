'use client';

import { APIProvider, Map, AdvancedMarker, Pin, Marker } from '@vis.gl/react-google-maps';

interface Location {
  lat: number;
  lng: number;
}

interface MapProps {
  locations: Location[];
  center?: Location;
  zoom?: number;
}

export default function GoogleMapComponent({ locations, center, zoom = 12 }: MapProps) {
  const mapCenter = center || (locations.length > 0 ? locations[0] : { lat: 35.6895, lng: 139.6917 });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Google Maps API Key が設定されていません。</p>
        <p className="text-gray-400 text-sm mt-1">.env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください。</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          {...(mapId ? { mapId } : {})}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          {locations.map((loc, index) =>
            mapId ? (
              <AdvancedMarker key={index} position={loc}>
                <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
              </AdvancedMarker>
            ) : (
              <Marker key={index} position={loc} />
            )
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
