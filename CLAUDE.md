# 麻雀オンラインアプリ - 開発仕様書

## プロジェクト概要

WebSocketを使用したリアルタイム4人対戦麻雀アプリです。

### 技術スタック
- **バックエンド**: Node.js + TypeScript + Express + Socket.io
- **フロントエンド**: React 19 + TypeScript + Vite + Tailwind CSS
- **テスト**: Vitest

## アーキテクチャ

### Monorepo構成
```
demo-app/
├── packages/
│   ├── mahjong-core/             # 麻雀ロジック（牌・判定・点数計算）
│   └── mahjong-web/              # Webアプリケーション
│       ├── server/               # バックエンド（Socket.io）
│       └── client/               # フロントエンド（React）
├── package.json                  # ルートpackage.json
└── CLAUDE.md
```

### 起動方法
```bash
npm run dev        # サーバー + クライアント同時起動
npm run dev:server # サーバーのみ（http://localhost:3000）
npm run dev:client # クライアントのみ（http://localhost:5173）
```

## 実装状況

### 完了済み機能
- ✅ 認証システム（UUID + 表示名）
- ✅ ルーム管理（作成・参加・退出）
- ✅ ホストシステム（権限管理）
- ✅ 準備状態管理
- ✅ ゲーム開始システム
- ✅ チャットシステム
- ✅ 麻雀コアライブラリ（牌・判定・点数計算）

### 開発中・次のステップ
- 🚧 実際の麻雀ゲームロジック統合
- 🚧 牌の配布・ツモ・切り機能
- 📋 鳴きシステム（ポン・チー・カン）
- 📋 和了判定・点数計算の実装

## 主要仕様

### Socket.io通信
- 認証、ルーム操作、ゲーム進行、チャット
- リアルタイム状態同期
- 自動再接続・エラーハンドリング

### UI/UX
- Tailwind CSS使用
- レスポンシブデザイン
- 状態別カラーコーディング
- 直感的な操作フロー

### セキュリティ
- UUID による内部識別
- ホスト権限管理
- 入力値バリデーション

## 開発ガイドライン

### TypeScript
- 厳密な型チェック
- `import type` 使用
- 共通型定義は `@mahjong/core` で管理

### 品質管理
- ESLint + Vitest
- ユニットテスト実装
- CORS設定済み

---

**最終更新**: 2025-01-07  
**ステータス**: 基盤機能完了、麻雀ゲームロジック実装中