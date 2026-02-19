-- ============================================
-- Migration: areas テーブル作成 & spots テーブルへの area_id 追加
-- Purpose: エリアの明示的な管理機能を追加
-- ============================================

-- 1. areas テーブル作成
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_jp text,
  description text,
  bounds geography(Polygon, 4326),
  image_url text,
  created_at timestamptz default now() not null
);
comment on table public.areas is 'エリアマスタ（東京・京都・大阪など）';

alter table public.areas enable row level security;

-- 全ユーザー閲覧可能
create policy "areas_read_public" on public.areas
  for select to authenticated
  using (true);

create index idx_areas_bounds on public.areas using GIST (bounds);

-- 2. spots テーブルに area_id カラムを追加
alter table public.spots
  add column area_id uuid references public.areas(id) on delete set null;

create index idx_spots_area_id on public.spots(area_id);

-- 3. 初期エリアデータの投入
insert into public.areas (name_en, name_jp, description, bounds) values
  (
    'Tokyo',
    '東京',
    '秋葉原・渋谷・新宿など、アニメ聖地が集中するエリア',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
      'LINESTRING(139.5 35.5, 140.0 35.5, 140.0 35.85, 139.5 35.85, 139.5 35.5)'
    )), 4326)
  ),
  (
    'Kyoto',
    '京都',
    '伏見稲荷・嵐山など、歴史とアニメが交差するエリア',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
      'LINESTRING(135.6 34.9, 135.85 34.9, 135.85 35.1, 135.6 35.1, 135.6 34.9)'
    )), 4326)
  ),
  (
    'Osaka',
    '大阪',
    '道頓堀・日本橋など、活気あふれる聖地が揃うエリア',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
      'LINESTRING(135.4 34.6, 135.6 34.6, 135.6 34.75, 135.4 34.75, 135.4 34.6)'
    )), 4326)
  ),
  (
    'Kamakura',
    '鎌倉',
    'スラムダンクの踏切をはじめ、湘南エリアの名所が集まる聖地',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
      'LINESTRING(139.48 35.28, 139.6 35.28, 139.6 35.38, 139.48 35.38, 139.48 35.28)'
    )), 4326)
  ),
  (
    'Chichibu',
    '秩父',
    '「あの花」の舞台として有名な埼玉県秩父エリア',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
      'LINESTRING(138.95 35.95, 139.15 35.95, 139.15 36.05, 138.95 36.05, 138.95 35.95)'
    )), 4326)
  );
