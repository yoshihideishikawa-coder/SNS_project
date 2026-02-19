export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Area {
  id: string;
  nameEn: string;
  nameJp: string;
  description?: string;
  imageUrl?: string;
}

export interface Spot {
  id: string;
  name: string;
  nameJp?: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  area?: Area;
}

export interface RouteSpot {
  id: string;
  spot: Spot;
  orderIndex: number;
  visitedAt: string;
  photoUrl: string;
  comment?: string;
}

export interface Route {
  id: string;
  title: string;
  description: string;
  author: User;
  coverPhotoUrl: string;
  spots: RouteSpot[];
  createdAt: string;
  likes: number;
  isSaved?: boolean;
}

export const MOCK_AREAS: Area[] = [
  {
    id: "area-tokyo",
    nameEn: "Tokyo",
    nameJp: "東京",
    description: "秋葉原・渋谷・新宿など、アニメ聖地が集中するエリア",
  },
  {
    id: "area-kyoto",
    nameEn: "Kyoto",
    nameJp: "京都",
    description: "伏見稲荷・嵐山など、歴史とアニメが交差するエリア",
  },
  {
    id: "area-osaka",
    nameEn: "Osaka",
    nameJp: "大阪",
    description: "道頓堀・日本橋など、活気あふれる聖地が揃うエリア",
  },
  {
    id: "area-kamakura",
    nameEn: "Kamakura",
    nameJp: "鎌倉",
    description: "スラムダンクの踏切をはじめ、湘南エリアの名所が集まる聖地",
  },
  {
    id: "area-chichibu",
    nameEn: "Chichibu",
    nameJp: "秩父",
    description: "「あの花」の舞台として有名な埼玉県秩父エリア",
  },
];

const AREA_TOKYO = MOCK_AREAS[0];
const AREA_KYOTO = MOCK_AREAS[1];

export const CURRENT_USER: User = {
  id: "user-1",
  name: "Guest User",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
};

export const MOCK_ROUTES: Route[] = [
  {
    id: "route-1",
    title: "Akihabara Cyberpunk Night",
    description: "Walking through the neon streets of Akihabara at night. Feels like anime.",
    author: {
      id: "alex",
      name: "Alex",
      avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60",
    },
    coverPhotoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60",
    likes: 120,
    createdAt: "2023-10-15T10:00:00Z",
    spots: [
      {
        id: "rs-1",
        orderIndex: 0,
        visitedAt: "2023-10-15T18:00:00Z",
        photoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60",
        comment: "Start here! The lights are amazing.",
        spot: {
          id: "spot-1",
          name: "Akihabara Station",
          nameJp: "秋葉原駅",
          latitude: 35.6984,
          longitude: 139.7731,
          imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60",
          area: AREA_TOKYO,
        },
      },
      {
        id: "rs-2",
        orderIndex: 1,
        visitedAt: "2023-10-15T19:30:00Z",
        photoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60",
        comment: "Kanda Myojin Shrine nearby.",
        spot: {
          id: "spot-2",
          name: "Kanda Myojin",
          nameJp: "神田明神",
          latitude: 35.7020,
          longitude: 139.7679,
          imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60",
          area: AREA_TOKYO,
        },
      },
    ],
  },
  {
    id: "route-2",
    title: "Kyoto Fushimi Inari Morning",
    description: "Early morning hike to avoid crowds. The torii gates are endless.",
    author: {
      id: "sarah",
      name: "Sarah",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
    },
    coverPhotoUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&auto=format&fit=crop&q=60",
    likes: 342,
    createdAt: "2023-11-02T07:00:00Z",
    spots: [
      {
        id: "rs-3",
        orderIndex: 0,
        visitedAt: "2023-11-02T07:30:00Z",
        photoUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&auto=format&fit=crop&q=60",
        spot: {
          id: "spot-3",
          name: "Fushimi Inari Taisha",
          nameJp: "伏見稲荷大社",
          latitude: 34.9671,
          longitude: 135.7727,
          imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&auto=format&fit=crop&q=60",
          area: AREA_KYOTO,
        },
      },
    ],
  },
  {
    id: "route-3",
    title: "Shibuya Crossing Chaos",
    description: "The most busy crossing in the world.",
    author: {
      id: "mike",
      name: "Mike",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
    },
    coverPhotoUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60",
    likes: 89,
    createdAt: "2023-12-10T14:00:00Z",
    spots: [
      {
        id: "rs-4",
        orderIndex: 0,
        visitedAt: "2023-12-10T14:00:00Z",
        photoUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60",
        spot: {
          id: "spot-4",
          name: "Shibuya Crossing",
          nameJp: "渋谷スクランブル交差点",
          latitude: 35.6595,
          longitude: 139.7004,
          imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60",
          area: AREA_TOKYO,
        },
      },
    ],
  },
];
