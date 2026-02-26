'use server';

import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers';
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
        order_index: meta.orderIndex,
        visited_at: meta.visitedAt,
        photo_url: photoUrl,
        latitude: meta.latitude || 0,
        longitude: meta.longitude || 0,
        is_manual_spot: false,
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
