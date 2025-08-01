# 麻雀オンラインアプリ - 開発仕様書

## プロジェクトルール
- コミュニケーションは日本語で行う

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
│   ├── mahjong-web-types/        # 共有型定義
│   ├── mahjong-web-server/       # バックエンド（Socket.io）
│   └── mahjong-web-client/       # フロントエンド（React）
├── package.json                  # ルートpackage.json
└── CLAUDE.md
```

### 起動方法
```bash
npm run dev        # サーバー + クライアント同時起動
npm run dev:server # サーバーのみ（http://localhost:3000）
npm run dev:client # クライアントのみ（http://localhost:5173）
```

### パッケージ詳細
- **@mahjong/core**: 麻雀ロジック（牌・判定・点数計算）
- **@mahjong/web-types**: クライアント・サーバー共有型定義
- **@mahjong/web-server**: WebSocketサーバー（Socket.io）
- **@mahjong/web-client**: Reactクライアント（Vite + Tailwind CSS）
