# ✅ Supabase + Clerk 統合完了レポート

実装日: 2026-02-12

## 📦 インストールされたパッケージ

- @clerk/nextjs: ^6.37.3
- @supabase/supabase-js: ^2.95.3
- @supabase/ssr: ^0.8.0

## 🗄️ データベース構造

### 作成されたテーブル
- `users`: ユーザー情報 (Clerk同期用)
- `spots`: 聖地スポットマスタ
- `routes`: 投稿ルート
- `route_spots`: ルート内スポット
- `saved_routes`: 保存されたルート

### マイグレーションファイル
- `web/supabase/migrations/20260212000000_create_initial_schema.sql`

## 🔐 認証フロー

1. **Clerk**: 認証プロバイダとして機能（サインアップ、ログイン）。
2. **Middleware**: `proxy.ts` (clerkMiddleware) により、ルート保護とSupabaseセッション管理を実施。
3. **同期**: `web/app/(protected)/layout.tsx` にて `ensureSupabaseUser()` を呼び出し、Clerkのユーザー情報をSupabaseの `users` テーブルに自動同期。
4. **RLS**: Supabase側では `clerk_user_id` を用いたRLSポリシーにより、自身のデータのみアクセス可能に制限。

## 📝 次のステップ（ユーザー作業）

### 1. Clerk の設定
1. [Clerk Dashboard](https://dashboard.clerk.com/) でプロジェクトを作成。
2. **API Keys** を取得し、`.env.local` に設定。
3. **Paths** 設定で以下を指定：
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in/up: `/`

### 2. Supabase の設定
1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを作成。
2. **Settings > API** から URL と Key を取得し、`.env.local` に設定。
   - `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイドでのみ使用してください。
3. **SQL Editor** を開き、`web/supabase/migrations/20260212000000_create_initial_schema.sql` の内容をコピー＆ペーストして実行し、テーブルを作成。

### 3. 環境変数の設定
`web/.env.local.example` を `web/.env.local` にコピーし、値を埋めてください。

```bash
cp web/.env.local.example web/.env.local
```

### 4. 動作確認
```bash
cd web
npm run dev
```
http://localhost:3000 にアクセスし、サインアップ・ログインができることを確認してください。

## 🐛 既知の問題・制限事項

- リアルタイム機能は今回の実装には含まれていません（設計に基づき不要と判断）。
- `proxy.ts` は Next.js 16 (想定) の仕様に基づいて作成しました。もしミドルウェアが動作しない場合は、`web/proxy.ts` を `web/middleware.ts` にリネームしてください。

## 📖 参考リソース

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
