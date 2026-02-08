# UI/UX デザイン設計書

## 1. 概要
本ドキュメントは、「Seichi Route（仮）」のユーザーインターフェースと体験設計を定義します。

## 2. デザインコンセプト

### コンセプトワード
**"Immersive Japan" (没入する日本)**
- コンテンツ（写真）を主役にし、UIは黒子に徹する。
- 日本らしい美意識（余白、赤のアクセント）を取り入れる。

### カラーパレット
| 色名 | カラーコード | 用途 |
| :--- | :--- | :--- |
| **Base White** | `#FFFFFF` | 背景色（ライトモード） |
| **Base Black** | `#121212` | 背景色（ダークモード）、テキスト |
| **Japan Red** | `#BC002D` | プライマリアクション、アクセント、いいね |
| **Sub Text** | `#8E8E93` | 補足テキスト、非活性状態 |
| **Border** | `#E5E5EA` | 区切り線 |

### タイポグラフィ
システムフォントを優先し、読み込み速度とネイティブ感を重視。
- **欧文**: Inter, SF Pro Display (iOS), Roboto (Android)
- **和文**: Noto Sans JP (必要な場合のみロード)

## 3. 画面遷移図

```mermaid
graph TD
    Splash[Splash Screen] --> Onboarding[Onboarding]
    Onboarding --> Login[Login / Signup]
    Login --> Home[Home (Timeline)]
    
    subgraph MainTab
        Home
        PostSelect[Post: Select Photos]
        MyPage[My Page]
    end
    
    Home -->|Toggle| GridView[Home (Grid)]
    GridView -->|Toggle| Home
    
    Home -->|Tap Photo| RouteDetail[Route Detail]
    GridView -->|Tap Photo| RouteDetail
    
    RouteDetail -->|Tap Author| UserProfile[User Profile]
    RouteDetail -->|Tap Map| MapFullScreen[Map Full Screen]
    
    PostSelect -->|Select & Next| PostConfirm[Post: Confirm Route]
    PostConfirm -->|Edit Spot| SpotSearch[Spot Search Modal]
    PostConfirm -->|Submit| RouteDetail
    
    MyPage -->|Tap Saved| SavedList[Saved Routes]
    MyPage -->|Tap Setting| Settings[Settings]
```

## 4. 主要画面ワイヤーフレーム

### 4.1 Home (Timeline View)
没入感を重視した、画面幅いっぱいのカード型リスト。

```
+-----------------------------------+
| [Logo]        [Grid Icon] [Search]|  <-- Transparent Header
+-----------------------------------+
|                                   |
| [       Photo (Aspect 4:5)      ] |  <-- Main Content
| [                               ] |
|                                   |
+-----------------------------------+
| [Spot Name] @Akihabara            |  <-- Overlay Bottom
| [Route Map Mini]  [Title]         |
| [User Icon] Alex  [<3 120] [Save] |
+-----------------------------------+
|                                   |
| (Next Post...)                    |
|                                   |
+-----------------------------------+
| [Home]      [  +  ]      [User]   |  <-- Bottom Tab Bar
+-----------------------------------+
```

### 4.2 Route Detail
ルートの全体像と詳細を確認する画面。

```
+-----------------------------------+
| [< Back]    [Title]       [Share] |
+-----------------------------------+
| [Hero Photo]                      |
| "Akihabara Anime Tour"            |
| by Alex  |  2023.10.15            |
+-----------------------------------+
| [Map View (Interactive)]          |
|  (P)--(P)--(P)                    |
+-----------------------------------+
| Route Timeline:                   |
|                                   |
| (O) 10:00  [Spot A: Station]      |
|  |  "Start here!"                 |
|  |  [Photo Thumb]                 |
|                                   |
| (O) 10:30  [Spot B: Shrine]       |
|  |  "Famous stairs scene"         |
|  |  [Photo Thumb]                 |
|                                   |
+-----------------------------------+
| [      Start Navigation (Go)    ] |  <-- Sticky Bottom Button
+-----------------------------------+
```

### 4.3 Post (Confirm Route)
自動生成されたルートを確認・修正する画面。

```
+-----------------------------------+
| [< Back]    New Post       [Post] |
+-----------------------------------+
| [Title Input]                     |
| [Description Input]               |
+-----------------------------------+
| Suggested Route:                  |
|                                   |
| 1. [Thumb] 10:00                  |
|    Detected: [Kanda Myojin] [x]   |  <-- DB Match
|                                   |
| 2. [Thumb] 11:15                  |
|    Detected: [Unknown]      [?]   |  <-- No Match
|    -> [Search Spot Button]        |
|                                   |
+-----------------------------------+
| [Map Preview]                     |
+-----------------------------------+
```

## 5. インタラクション設計
- **いいね**: ダブルタップで「いいね」アニメーション（ハートが跳ねる）。
- **画像表示**: タップでライトボックス表示（拡大・ピンチインアウト）。
- **無限スクロール**: タイムライン下部到達時に追加読み込みスケルトンを表示。
