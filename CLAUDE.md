# 麻雀オンラインアプリ - 開発仕様書

## プロジェクト概要

WebSocketを使用したリアルタイム4人対戦麻雀アプリです。

### 技術スタック

**バックエンド:**
- Node.js + TypeScript
- Express (REST API)
- Socket.io (WebSocket通信)
- UUID (ユーザー識別)

**フロントエンド:**
- React + TypeScript
- Vite (ビルドツール)
- Socket.io-client (リアルタイム通信)
- Tailwind CSS (スタイリング)

## プロジェクト構成

```
demo-app/
├── packages/
│   ├── mahjong-core/             # 麻雀ロジック（タイル、手牌、判定）
│   │   ├── src/
│   │   │   ├── hands/            # 手牌・和了判定
│   │   │   ├── scoring/          # 点数計算
│   │   │   └── tiles/            # 牌関連
│   │   └── package.json
│   ├── mahjong-game/             # ゲーム管理（プレイヤー、ルーム）
│   │   ├── src/
│   │   │   ├── game/             # ゲーム状態管理
│   │   │   ├── player/           # プレイヤー管理
│   │   │   └── room/             # ルーム管理
│   │   └── package.json
│   └── mahjong-web/              # Webアプリケーション
│       ├── server/               # バックエンド
│       │   ├── src/
│       │   │   ├── index.ts      # メインサーバーファイル
│       │   │   ├── managers/     # ルーム管理クラス
│       │   │   └── types/        # 型定義（coreから再エクスポート）
│       │   └── package.json
│       ├── client/               # フロントエンド
│       │   ├── src/
│       │   │   ├── App.tsx       # メインアプリ
│       │   │   ├── App.css       # カスタムスタイル
│       │   │   ├── index.css     # Tailwind CSS読み込み
│       │   │   ├── hooks/
│       │   │   │   └── useSocket.ts # Socket.io カスタムフック
│       │   │   └── types/        # 型定義（coreから再エクスポート）
│       │   ├── package.json
│       │   ├── vite.config.ts
│       │   ├── tailwind.config.js
│       │   ├── postcss.config.js
│       │   └── tsconfig.json
│       └── package.json          # Web パッケージ
├── package.json                  # ルートpackage.json（monorepo設定）
└── CLAUDE.md                     # この仕様書
```

## 起動方法

**プロジェクトルートから（推奨）:**
```bash
npm run dev        # サーバー + クライアント同時起動
npm run dev:server # サーバーのみ起動（http://localhost:3000）
npm run dev:client # クライアントのみ起動（http://localhost:5173）
```

**個別起動:**
```bash
# サーバー
cd packages/mahjong-web/server
npm run dev

# クライアント  
cd packages/mahjong-web/client
npm run dev
```

## 実装済み機能

### 1. 認証システム

**仕様:**
- ゲストユーザーのみ（登録不要）
- UUID + 表示名で識別
- 同名ユーザー許可（システム内部でUUIDで区別）

**フロー:**
1. プレイヤー名入力
2. 自動的にUUID生成・認証
3. ルーム選択画面に移行

### 2. ルーム管理システム

**ルーム仕様:**
- 6桁数字のルームID（自動生成）
- 最大4人まで参加
- 空になったルームは自動削除

**機能:**
- ルーム作成（作成者は自動参加）
- ルーム参加（IDで検索）
- ルーム退出
- リアルタイム状態同期

### 3. ホストシステム

**ホスト権限:**
- ルーム作成者が初期ホスト
- ホスト退出時は次のプレイヤーが自動昇格
- ゲーム開始権限（ホストのみ）

**UI表示:**
- ホストには青いボーダーと「(ホスト)」表示
- ホスト専用「ゲーム開始」ボタン

### 4. 準備状態管理

**仕様:**
- 各プレイヤーの準備状態を管理
- 「準備完了」「準備中」の切り替え
- 全員準備完了時の通知

### 5. ゲーム開始システム

**開始条件:**
- 4人全員が参加
- 全員が準備完了
- ホストがゲーム開始ボタンをクリック

**バリデーション:**
- 人数不足時のエラー表示
- 準備未完了時のエラー表示
- 非ホストの開始試行防止

## データ構造

### Player（プレイヤー）
```typescript
interface Player {
  userId: string;      // UUID（内部管理用）
  displayName: string; // 表示名（同名OK）
  socketId: string;    // Socket接続ID
  isReady: boolean;    // 準備状態
  isHost: boolean;     // ホスト権限
}
```

### Room（ルーム）
```typescript
interface Room {
  roomId: string;      // 6桁数字ID
  players: Player[];   // プレイヤー配列（最大4人）
  maxPlayers: number;  // 最大人数（固定4）
  createdAt: number;   // 作成時刻
  gameStarted: boolean; // ゲーム開始フラグ
}
```

## Socket.io イベント仕様

### クライアント → サーバー

| イベント名 | パラメータ | 説明 |
|-----------|-----------|------|
| `authenticate` | `{ displayName: string }` | ユーザー認証 |
| `create-room` | なし | ルーム作成 |
| `join-room` | `{ roomId: string }` | ルーム参加 |
| `leave-room` | なし | ルーム退出 |
| `toggle-ready` | なし | 準備状態切り替え |
| `start-game` | なし | ゲーム開始（ホストのみ） |

### サーバー → クライアント

| イベント名 | パラメータ | 説明 |
|-----------|-----------|------|
| `authenticated` | `{ userId: string, displayName: string }` | 認証完了 |
| `room-created` | `{ roomId: string }` | ルーム作成完了 |
| `room-joined` | `{ room: Room }` | ルーム参加完了 |
| `room-left` | なし | ルーム退出完了 |
| `room-update` | `{ room: Room }` | ルーム状態更新 |
| `all-players-ready` | なし | 全員準備完了 |
| `game-started` | `{ room: Room }` | ゲーム開始 |
| `join-error` | `{ message: string }` | エラー通知 |

## UI/UX仕様（Tailwind CSS）

### デザインシステム
- **カラーパレット**: Gray-50背景、白いカードデザイン
- **レスポンシブ**: モバイルファーストデザイン
- **アニメーション**: Hover効果とTransition
- **タイポグラフィ**: システムフォント、適切なサイズ階層

### 認証画面
- 中央配置のカードレイアウト
- プレイヤー名入力フィールド（青いフォーカスリング）
- ブルー系「ゲーム開始」ボタン
- 背景: `bg-gray-50`、カード: `bg-white shadow-md`

### ルーム選択画面
- 2カラムグリッドレイアウト（モバイルでは1カラム）
- 「新しいルームを作成」：緑色ボタン
- 「既存のルームに参加」：緑色ボタン、入力フィールド付き
- エラーメッセージ：赤系カラー、境界線付き

### ルーム画面
- フレックスヘッダー（タイトル + 退出ボタン）
- プレイヤーカード一覧（ボーダーと背景色で状態表示）
- フルワイドボタンエリア
- ゲーム状態表示（色付きアラート）

### カラーコーディング（Tailwind Classes）
- **通常プレイヤー**: `border-gray-300 bg-white`
- **準備完了プレイヤー**: `border-green-500 bg-green-50`
- **ホスト**: `border-blue-500 bg-blue-50`
- **ホスト準備完了**: `border-cyan-500 bg-cyan-50`
- **ステータスバッジ**: 
  - 準備完了: `bg-green-100 text-green-800`
  - 準備中: `bg-gray-100 text-gray-800`

## エラーハンドリング

### よくあるエラーと対処

| エラーメッセージ | 原因 | 対処 |
|----------------|------|------|
| "ユーザー認証が必要です" | 未認証状態でのアクション | 再認証を促す |
| "ルームが見つかりません" | 無効なルームID | IDの再確認を促す |
| "ルームが満員です" | 4人満員のルーム参加 | 他のルームを案内 |
| "ホストのみがゲームを開始できます" | 非ホストのゲーム開始試行 | ホスト権限の説明 |
| "4人揃ってからゲームを開始してください" | 人数不足でのゲーム開始 | 追加プレイヤー待ちを案内 |
| "全員の準備が完了してからゲームを開始してください" | 準備未完了でのゲーム開始 | 準備完了待ちを案内 |

## 接続・切断処理

### 正常なフロー
1. Socket.io接続確立
2. 認証完了
3. ルーム参加
4. ゲーム開始

### 異常系対応
- **接続断**: 自動再接続（Socket.io標準機能）
- **プレイヤー退出**: ルームから自動削除、他プレイヤーに通知
- **ホスト退出**: 次のプレイヤーが自動昇格
- **ルーム空**: 自動削除

## 今後の拡張予定

### Phase 1: 麻雀ゲームロジック（実装中）
- ✅ 牌データ構造の設計（完了）
- ✅ 麻雀関連型定義（完了）
- ✅ monorepo構造への移行（完了）
- 🚧 牌生成・シャッフルシステム
- 🚧 配牌・ツモ・切りロジック
- 📋 鳴きシステム（ポン・チー・カン）
- 📋 和了判定・点数計算

### Phase 2: UI/UX改善
- 牌の3D表示
- ドラッグ&ドロップ操作
- アニメーション効果
- 音響効果

### Phase 3: 追加機能
- 観戦モード
- チャット機能
- リプレイ機能
- カスタムルール設定

## 開発注意事項

### TypeScript関連
- 型インポートは `import type` を使用
- verbatimModuleSyntax対応済み

### Socket.io関連
- 各イベントに適切なエラーハンドリング実装
- リアルタイム状態同期の一貫性確保

### セキュリティ考慮
- UUIDによる内部識別（なりすまし対策）
- ホスト権限の適切な管理
- 入力値のバリデーション

### スタイリング関連
- Tailwind CSS使用（カスタムCSS最小化）
- レスポンシブデザイン対応
- アクセシビリティ考慮（フォーカス、コントラスト）
- 一貫性のあるデザインシステム

### Monorepo関連
- npm workspaces使用
- packages配下でパッケージ管理
- 共通型定義は`@mahjong/core`と`@mahjong/game`で管理
- client/serverの`types/index.ts`は再エクスポートのみ
- 将来的なゲームロジック型の拡張を考慮

### CORS設定
- サーバーは`localhost:5173`と`127.0.0.1:5173`の両方に対応
- 開発環境での接続問題を解決済み

---

**最終更新:** 2025-06-24  
**ステータス:** monorepo構造完了、CORS問題解決済み、基盤機能完了