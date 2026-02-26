import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Route, Area, MOCK_AREAS } from './mock-data';

const AREA_BOUNDS: { area: Area; latMin: number; latMax: number; lngMin: number; lngMax: number }[] = [
  { area: MOCK_AREAS[0], latMin: 35.5, latMax: 35.85, lngMin: 139.5, lngMax: 139.95 },  // 東京
  { area: MOCK_AREAS[1], latMin: 34.85, latMax: 35.15, lngMin: 135.65, lngMax: 135.85 }, // 京都
  { area: MOCK_AREAS[2], latMin: 34.55, latMax: 34.8, lngMin: 135.35, lngMax: 135.6 },   // 大阪
  { area: MOCK_AREAS[3], latMin: 35.28, latMax: 35.4, lngMin: 139.5, lngMax: 139.6 },    // 鎌倉
  { area: MOCK_AREAS[4], latMin: 35.9, latMax: 36.1, lngMin: 138.85, lngMax: 139.2 },    // 秩父
];

function detectArea(lat: number, lng: number): Area | undefined {
  for (const { area, latMin, latMax, lngMin, lngMax } of AREA_BOUNDS) {
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return area;
    }
  }
  return undefined;
}

export async function getDBRoutes(): Promise<Route[]> {
  const supabase = createServiceRoleClient();

  const { data: routes, error } = await supabase
    .from('routes')
    .select(`
      *,
      users!routes_user_id_fkey ( id, display_name, avatar_url ),
      route_spots ( * )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch routes:', error);
    return [];
  }

  return (routes ?? []).map((route) => {
    const sortedSpots = (route.route_spots ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    );

    const firstSpot = sortedSpots[0];
    const area = firstSpot ? detectArea(firstSpot.latitude, firstSpot.longitude) : undefined;

    return {
      id: route.id,
      title: route.title,
      description: route.description ?? '',
      author: {
        id: route.users?.id ?? 'unknown',
        name: route.users?.display_name ?? 'Anonymous',
        avatarUrl: route.users?.avatar_url ?? '',
      },
      coverPhotoUrl: route.cover_photo_url || '',
      likes: route.save_count ?? 0,
      createdAt: route.created_at,
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
        orderIndex: rs.order_index,
        visitedAt: rs.visited_at ?? '',
        photoUrl: rs.photo_url,
        comment: rs.comment ?? undefined,
        spot: {
          id: rs.id,
          name: `Spot ${rs.order_index + 1}`,
          latitude: rs.latitude,
          longitude: rs.longitude,
          imageUrl: rs.photo_url,
          area: detectArea(rs.latitude, rs.longitude),
        },
      })),
    } satisfies Route;
  });
}
