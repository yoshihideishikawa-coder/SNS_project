-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: Seichi Route の基本テーブル構造を作成
-- Tables: users, spots, routes, route_spots, saved_routes
-- ============================================

-- PostGIS 拡張の有効化
create extension if not exists "postgis";

-- 1. users テーブル
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.users is 'ユーザー情報 (Clerk同期)';

alter table public.users enable row level security;

-- 全ユーザーがプロフィール閲覧可能（アプリ内のユーザー表示用）
create policy "users_read_public" on public.users
  for select to authenticated
  using (true);

-- 自身のデータのみ挿入可能
create policy "users_insert_own_data" on public.users
  for insert to authenticated
  with check (clerk_user_id = auth.jwt() ->> 'sub');

-- 自身のデータのみ更新可能
create policy "users_update_own_data" on public.users
  for update to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub')
  with check (clerk_user_id = auth.jwt() ->> 'sub');

create index idx_users_clerk_user_id on public.users(clerk_user_id);


-- 2. spots テーブル (聖地マスタ)
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_jp text,
  description text,
  location geography(Point, 4326) not null,
  works_name text not null,
  address text,
  image_url text,
  created_at timestamptz default now() not null
);
comment on table public.spots is '聖地スポットマスタ';

alter table public.spots enable row level security;

-- 全ユーザー閲覧可能
create policy "spots_read_public" on public.spots
  for select to authenticated
  using (true);

-- 書き込みは管理者のみ（ここではポリシーを作成せずデフォルト拒否、または別途管理者ロール設定が必要）

create index idx_spots_location on public.spots using GIST (location);


-- 3. routes テーブル (投稿ルート)
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  cover_photo_url text,
  view_count int default 0,
  save_count int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.routes is '投稿ルート';

alter table public.routes enable row level security;

-- 全ユーザー閲覧可能
create policy "routes_read_public" on public.routes
  for select to authenticated
  using (true);

-- 自身のルートのみ作成可能
create policy "routes_insert_own" on public.routes
  for insert to authenticated
  with check (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- 自身のルートのみ更新可能
create policy "routes_update_own" on public.routes
  for update to authenticated
  using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  )
  with check (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- 自身のルートのみ削除可能
create policy "routes_delete_own" on public.routes
  for delete to authenticated
  using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create index idx_routes_created_at on public.routes(created_at desc);
create index idx_routes_user_id on public.routes(user_id);


-- 4. route_spots テーブル (ルート内スポット)
create table public.route_spots (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  spot_id uuid references public.spots(id),
  order_index int not null,
  visited_at timestamptz,
  comment text,
  photo_url text not null,
  latitude float not null,
  longitude float not null,
  is_manual_spot boolean default false
);
comment on table public.route_spots is 'ルート内スポット';

alter table public.route_spots enable row level security;

-- 全ユーザー閲覧可能
create policy "route_spots_read_public" on public.route_spots
  for select to authenticated
  using (true);

-- 親ルートの所有者のみ操作可能
create policy "route_spots_insert_own" on public.route_spots
  for insert to authenticated
  with check (
    route_id in (
      select id from public.routes 
      where user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "route_spots_update_own" on public.route_spots
  for update to authenticated
  using (
    route_id in (
      select id from public.routes 
      where user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  )
  with check (
    route_id in (
      select id from public.routes 
      where user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );
  
create policy "route_spots_delete_own" on public.route_spots
  for delete to authenticated
  using (
    route_id in (
      select id from public.routes 
      where user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create index idx_route_spots_route_id on public.route_spots(route_id);


-- 5. saved_routes テーブル (保存リスト)
create table public.saved_routes (
  user_id uuid not null references public.users(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, route_id)
);
comment on table public.saved_routes is '保存されたルート';

alter table public.saved_routes enable row level security;

-- 自身の保存リストのみ閲覧可能
create policy "saved_routes_select_own" on public.saved_routes
  for select to authenticated
  using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- 自身のみ保存可能
create policy "saved_routes_insert_own" on public.saved_routes
  for insert to authenticated
  with check (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- 自身のみ削除可能
create policy "saved_routes_delete_own" on public.saved_routes
  for delete to authenticated
  using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );
