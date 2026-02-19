import { MOCK_ROUTES } from '@/app/lib/mock-data';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import GoogleMapComponent from '@/components/map';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface DBSpot {
  id: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  comment: string;
  visitedAt: string;
  orderIndex: number;
}

interface DBRoute {
  id: string;
  title: string;
  description: string;
  coverPhotoUrl: string;
  createdAt: string;
  likes: number;
  author: { name: string; avatarUrl: string };
  spots: DBSpot[];
}

async function getRouteFromDB(id: string): Promise<DBRoute | null> {
  const supabase = createServiceRoleClient();

  const { data: route } = await supabase
    .from('routes')
    .select(`
      *,
      users ( display_name, avatar_url ),
      route_spots ( * )
    `)
    .eq('id', id)
    .single();

  if (!route) return null;

  const sortedSpots = (route.route_spots ?? []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  );

  return {
    id: route.id,
    title: route.title,
    description: route.description ?? '',
    coverPhotoUrl: route.cover_photo_url ?? '',
    createdAt: route.created_at,
    likes: route.save_count ?? 0,
    author: {
      name: route.users?.display_name ?? 'Anonymous',
      avatarUrl: route.users?.avatar_url ?? '',
    },
    spots: sortedSpots.map((rs: {
      id: string;
      photo_url: string;
      latitude: number;
      longitude: number;
      comment: string | null;
      visited_at: string | null;
      order_index: number;
    }) => ({
      id: rs.id,
      photoUrl: rs.photo_url,
      latitude: rs.latitude,
      longitude: rs.longitude,
      comment: rs.comment ?? '',
      visitedAt: rs.visited_at ?? '',
      orderIndex: rs.order_index,
    })),
  };
}

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const mockRoute = MOCK_ROUTES.find((r) => r.id === id);

  if (mockRoute) {
    const spots = mockRoute.spots.map((s) => ({
      lat: s.spot.latitude,
      lng: s.spot.longitude,
    }));
    const initialCenter = spots.length > 0 ? spots[0] : undefined;

    return (
      <div className="px-4 py-6">
        <Link href="/" className="text-sm text-gray-500 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-56 w-full">
            <Image
              src={mockRoute.coverPhotoUrl}
              alt={mockRoute.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-6">
            <h1 className="text-xl font-bold mb-2">{mockRoute.title}</h1>
            <p className="text-gray-600 mb-4">{mockRoute.description}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={mockRoute.author.avatarUrl}
                    alt={mockRoute.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span>By {mockRoute.author.name}</span>
              </div>
              <span>{new Date(mockRoute.createdAt).toLocaleDateString()}</span>
              <span>♥ {mockRoute.likes} Likes</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-3">Route Map</h2>
            <GoogleMapComponent locations={spots} center={initialCenter} zoom={13} />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Spots</h2>
            <div className="space-y-6">
              {mockRoute.spots.map((routeSpot, index) => (
                <div key={routeSpot.id} className="flex gap-4 border-b pb-4 last:border-0">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={routeSpot.photoUrl}
                      alt={routeSpot.spot.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl-lg">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{routeSpot.spot.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{routeSpot.spot.nameJp}</p>
                    <p className="text-sm text-gray-600 italic">&quot;{routeSpot.comment}&quot;</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        Lat: {routeSpot.spot.latitude}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        Lng: {routeSpot.spot.longitude}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(routeSpot.visitedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const route = await getRouteFromDB(id);

  if (!route) {
    notFound();
  }

  const spots = route.spots.map((s) => ({
    lat: s.latitude,
    lng: s.longitude,
  }));
  const initialCenter = spots.length > 0 ? spots[0] : undefined;

  return (
    <div className="px-4 py-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {route.coverPhotoUrl && (
          <div className="relative h-56 w-full">
            <Image
              src={route.coverPhotoUrl}
              alt={route.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-xl font-bold mb-2">{route.title}</h1>
          <p className="text-gray-600 mb-4">{route.description}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            {route.author.avatarUrl && (
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={route.author.avatarUrl}
                    alt={route.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span>By {route.author.name}</span>
              </div>
            )}
            <span>{new Date(route.createdAt).toLocaleDateString()}</span>
            <span>♥ {route.likes} Likes</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {spots.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">Route Map</h2>
            <GoogleMapComponent locations={spots} center={initialCenter} zoom={13} />
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold mb-3">Spots</h2>
          <div className="space-y-6">
            {route.spots.map((spot, index) => (
              <div key={spot.id} className="flex gap-4 border-b pb-4 last:border-0">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={spot.photoUrl}
                    alt={`Spot ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl-lg">
                    #{index + 1}
                  </div>
                </div>
                <div>
                  {spot.comment && (
                    <p className="text-sm text-gray-600 italic">&quot;{spot.comment}&quot;</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Lat: {spot.latitude}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Lng: {spot.longitude}
                    </span>
                  </div>
                  {spot.visitedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(spot.visitedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
