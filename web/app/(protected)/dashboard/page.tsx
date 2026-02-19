import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const { userId } = await auth()
  const supabase = await createClient()

  // ユーザー情報を取得
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId!)
    .single()

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold mb-4">ダッシュボード</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg">ようこそ、{user?.full_name ?? 'ゲスト'}さん</p>
        <p className="text-sm text-gray-500 mt-2">
          ユーザーID: {user?.id}
        </p>
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">マイ・ルート</h2>
            <p className="text-gray-500">まだルートがありません。</p>
        </div>
      </div>
    </div>
  )
}
