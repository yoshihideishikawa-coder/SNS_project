import { PropsWithChildren } from 'react'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  try {
    await ensureSupabaseUser()
  } catch (error) {
    console.error('Failed to ensure supabase user:', error)
  }

  return (
    <section className="min-h-screen bg-neutral-50">
      {children}
    </section>
  )
}
