"use client";

import {
  useAuth,
  UserButton 
} from '@clerk/nextjs'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export function Header() {
  const { isLoaded, userId } = useAuth()
  const isSignedIn = Boolean(userId)

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary">
            Seichi Route
          </Link>

          <div className="flex items-center gap-3">
            {isLoaded && isSignedIn && (
              <>
                <Link 
                  href="/post" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-black/80 transition-colors"
                >
                  <PlusCircle size={15} />
                  <span>投稿</span>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full"
                    }
                  }}
                />
              </>
            )}

            {isLoaded && !isSignedIn && (
              <>
                <Link href="/sign-in" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  ログイン
                </Link>
                <Link href="/sign-up" className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-black/80 transition-colors">
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
