import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from './service-role'

export async function getSupabaseUserByClerkId() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  return data ?? null
}

export async function ensureSupabaseUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const supabase = createServiceRoleClient()
  
  // Upsert user data
  // UserProfiles definition had 'display_name' and 'avatar_url', mapping from Clerk user
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null
  const email = user.emailAddresses[0]?.emailAddress ?? ''
  
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_user_id: userId,
        email: email,
        full_name: fullName,
        display_name: fullName, // Initial display name same as full name
        avatar_url: user.imageUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error syncing user to Supabase:', error)
    throw error
  }
  return data
}
