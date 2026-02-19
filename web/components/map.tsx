'use client';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

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

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Google Maps API Key is not set.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {locations.map((loc, index) => (
            <AdvancedMarker key={index} position={loc}>
              <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
