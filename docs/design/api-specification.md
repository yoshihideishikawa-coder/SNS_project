# API仕様書

## 1. 概要
本ドキュメントは、フロントエンド（Client Components）とバックエンド（Server Actions / Route Handlers）間の通信インターフェースを定義します。

## 2. 設計原則
- **プロトコル**: HTTPS
- **形式**: Next.js Server Actionsを基本とし、一部の外部連携等はREST API (Route Handlers) を使用。
- **データ形式**: JSON
- **認証**: Clerkのセッション情報を利用（サーバー側で `auth()` ヘルパーを使用）。

## 3. Server Actions 一覧

Next.js App Routerでは、APIエンドポイントの代わりにServer Actionsを関数として呼び出します。便宜上、関数名と入出力を定義します。

### 3.1 ルート関連

#### `generateRouteFromPhotos`
アップロードされた写真情報から、ルート候補を自動生成する。
- **Input**:
  ```typescript
  {
    photos: {
      fileKey: string; // Storage上のパス
      latitude: number;
      longitude: number;
      takenAt: Date;
    }[]
  }
  ```
- **Output**:
  ```typescript
  {
    success: boolean;
    routeDraft: {
      spots: {
        tempId: string;
        orderIndex: number;
        latitude: number;
        longitude: number;
        matchedSpotId?: string; // DB上の聖地ID（あれば）
        matchedSpotName?: string;
        photoUrl: string;
        takenAt: Date;
      }[];
    }
  }
  ```
- **処理**:
  1. PostGISの `ST_DWithin` を使用して、各写真の座標から半径Nメートル以内の `Spots` を検索。
  2. 最も近いスポットをマッチングさせる。
  3. `takenAt` でソートして順序を決定する。

#### `createRoute`
確定したルート情報をDBに保存する。
- **Input**:
  ```typescript
  {
    title: string;
    description?: string;
    spots: {
      spotId?: string; // DB上の聖地ID（あれば）
      latitude: number;
      longitude: number;
      photoUrl: string; // StorageのフルURL
      comment?: string;
      visitedAt: Date;
    }[];
  }
  ```
- **Output**:
  ```typescript
  {
    success: boolean;
    routeId: string; // 作成されたルートID
  }
  ```

#### `getTimelineRoutes`
タイムライン用のルート一覧を取得する。
- **Input**:
  ```typescript
  {
    page: number;
    limit: number;
  }
  ```
- **Output**:
  ```typescript
  {
    routes: RouteSummary[]; // ルート情報の配列
    nextPage: number | null;
  }
  ```

### 3.2 ユーザーアクション関連

#### `toggleSaveRoute`
ルートの保存/保存解除を切り替える。
- **Input**: `routeId: string`
- **Output**: `{ isSaved: boolean }`

## 4. Route Handlers (REST API) 一覧

外部サービスからのWebhookや、特定のGETリクエスト用。

### `GET /api/spots/search`
地図上の範囲検索やキーワード検索用。
- **Query Params**:
  - `lat`, `lng`: 中心座標
  - `radius`: 半径(m)
  - `q`: 検索キーワード
- **Response**:
  ```json
  {
    "spots": [
      {
        "id": "uuid",
        "name": "Spot Name",
        "location": { "lat": 35.xxx, "lng": 139.xxx }
      }
    ]
  }
  ```

## 5. エラーハンドリング
Server Actionsは、エラー時に例外をスローするか、以下の形式のオブジェクトを返します。
```typescript
{
  error: string; // エラーメッセージ
  code?: string; // エラーコード
}
```
フロントエンドではこれを受け取り、Toast通知等でユーザーにフィードバックします。
