'use server';

import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers';
import { getSupabaseUserByClerkId } from '@/lib/supabase/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function createRoute(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const user = await ensureSupabaseUser();
    if (!user) {
      return { success: false, error: 'User sync failed' };
    }

    const supabase = createServiceRoleClient();

    const { data: route, error: routeError } = await supabase
      .from('routes')
      .insert({
        user_id: user.id,
        title,
        description,
        cover_photo_url: '',
      })
      .select()
      .single();

    if (routeError) throw routeError;

    const bucketName = 'route-photos';
    let firstPhotoUrl = '';

    const photoKeys = Array.from(formData.keys()).filter((k) => k.startsWith('photos['));

    for (const key of photoKeys) {
      const index = key.match(/\d+/)?.[0];
      if (!index) continue;

      const file = formData.get(key) as File;
      const metaString = formData.get(`meta[${index}]`) as string;
      const meta = JSON.parse(metaString);

      const fileExt = file.name.split('.').pop();
      const fileName = `${route.id}/${index}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file);

      let photoUrl = '';
      if (uploadError) {
        console.error('Upload error:', uploadError);
        photoUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        photoUrl = publicUrl;
      }

      if (!firstPhotoUrl) firstPhotoUrl = photoUrl;

      await supabase.from('route_spots').insert({
        route_id: route.id,
        spot_id: meta.spotId || null,
        order_index: meta.orderIndex,
        visited_at: meta.visitedAt,
        photo_url: photoUrl,
        latitude: meta.latitude || 0,
        longitude: meta.longitude || 0,
        comment: meta.comment || null,
        is_manual_spot: !meta.spotId,
      });
    }

    if (firstPhotoUrl) {
      await supabase.from('routes').update({ cover_photo_url: firstPhotoUrl }).eq('id', route.id);
    }

    revalidatePath('/');
    return { success: true, data: route };
  } catch (error) {
    console.error('Create Route Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteRoute(routeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getSupabaseUserByClerkId();
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const supabase = createServiceRoleClient();

    const { data: route } = await supabase
      .from('routes')
      .select('id, user_id')
      .eq('id', routeId)
      .single();

    if (!route) {
      return { success: false, error: 'Route not found' };
    }

    if (route.user_id !== user.id) {
      return { success: false, error: 'Permission denied' };
    }

    const { data: spots } = await supabase
      .from('route_spots')
      .select('photo_url')
      .eq('route_id', routeId);

    const { error: deleteError } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId);

    if (deleteError) throw deleteError;

    if (spots && spots.length > 0) {
      const filePaths = spots
        .map((s) => {
          try {
            const url = new URL(s.photo_url);
            const match = url.pathname.match(/\/storage\/v1\/object\/public\/route-photos\/(.+)/);
            return match?.[1];
          } catch { return null; }
        })
        .filter((p): p is string => p !== null);

      if (filePaths.length > 0) {
        await supabase.storage.from('route-photos').remove(filePaths);
      }
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete Route Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
