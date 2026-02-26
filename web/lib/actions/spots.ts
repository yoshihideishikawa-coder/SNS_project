'use server';

import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { revalidatePath } from 'next/cache';

export interface SpotRow {
  id: string;
  name_en: string;
  name_jp: string | null;
  description: string | null;
  works_name: string;
  address: string | null;
  image_url: string | null;
  area_id: string | null;
  created_at: string;
  latitude: number;
  longitude: number;
  area?: { id: string; name_en: string; name_jp: string | null } | null;
}

export interface AreaRow {
  id: string;
  name_en: string;
  name_jp: string | null;
  description: string | null;
}

function parsePointFromEWKB(hex: string): { latitude: number; longitude: number } | null {
  if (!hex || hex.length < 42) return null;
  try {
    const buf = Buffer.from(hex, 'hex');
    const isLE = buf[0] === 1;
    const type = isLE ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
    const hasSRID = (type & 0x20000000) !== 0;
    const offset = hasSRID ? 9 : 5;
    const lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
    const lat = isLE ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function getSpots(): Promise<SpotRow[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('spots')
    .select('*, areas ( id, name_en, name_jp )')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getSpots error:', error);
    return [];
  }

  return (data ?? []).map((row) => {
    const coords = parsePointFromEWKB(row.location);
    return {
      id: row.id,
      name_en: row.name_en,
      name_jp: row.name_jp,
      description: row.description,
      works_name: row.works_name,
      address: row.address,
      image_url: row.image_url,
      area_id: row.area_id,
      created_at: row.created_at,
      latitude: coords?.latitude ?? 0,
      longitude: coords?.longitude ?? 0,
      area: row.areas ?? null,
    };
  });
}

export async function getAreas(): Promise<AreaRow[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('areas')
    .select('id, name_en, name_jp, description')
    .order('name_en');

  if (error) {
    console.error('getAreas error:', error);
    return [];
  }

  return data ?? [];
}

export async function createSpot(formData: FormData) {
  await requireAuth();
  const supabase = createServiceRoleClient();

  const nameEn = formData.get('name_en') as string;
  const nameJp = (formData.get('name_jp') as string) || null;
  const description = (formData.get('description') as string) || null;
  const worksName = formData.get('works_name') as string;
  const address = (formData.get('address') as string) || null;
  const imageUrl = (formData.get('image_url') as string) || null;
  const areaId = (formData.get('area_id') as string) || null;
  const lat = parseFloat(formData.get('latitude') as string);
  const lng = parseFloat(formData.get('longitude') as string);

  if (!nameEn || !worksName || isNaN(lat) || isNaN(lng)) {
    return { success: false, error: '必須項目を入力してください' };
  }

  const { error } = await supabase.from('spots').insert({
    name_en: nameEn,
    name_jp: nameJp,
    description,
    location: `SRID=4326;POINT(${lng} ${lat})`,
    works_name: worksName,
    address,
    image_url: imageUrl,
    area_id: areaId,
  });

  if (error) {
    console.error('createSpot error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/spots');
  return { success: true };
}

export async function updateSpot(id: string, formData: FormData) {
  await requireAuth();
  const supabase = createServiceRoleClient();

  const nameEn = formData.get('name_en') as string;
  const nameJp = (formData.get('name_jp') as string) || null;
  const description = (formData.get('description') as string) || null;
  const worksName = formData.get('works_name') as string;
  const address = (formData.get('address') as string) || null;
  const imageUrl = (formData.get('image_url') as string) || null;
  const areaId = (formData.get('area_id') as string) || null;
  const lat = parseFloat(formData.get('latitude') as string);
  const lng = parseFloat(formData.get('longitude') as string);

  if (!nameEn || !worksName || isNaN(lat) || isNaN(lng)) {
    return { success: false, error: '必須項目を入力してください' };
  }

  const { error } = await supabase
    .from('spots')
    .update({
      name_en: nameEn,
      name_jp: nameJp,
      description,
      location: `SRID=4326;POINT(${lng} ${lat})`,
      works_name: worksName,
      address,
      image_url: imageUrl,
      area_id: areaId,
    })
    .eq('id', id);

  if (error) {
    console.error('updateSpot error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/spots');
  return { success: true };
}

export async function deleteSpot(id: string) {
  await requireAuth();
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from('spots').delete().eq('id', id);

  if (error) {
    console.error('deleteSpot error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/spots');
  return { success: true };
}
