# rouh-mahjong-web
麻雀webアプリケーション

## Sakura App Run デプロイ設定

### 必要な GitHub Secrets

リポジトリの Settings > Secrets and variables > Actions で以下の secrets を設定してください：

- `SAKURA_API_KEY`: さくらのクラウド API キー
- `SAKURA_API_SECRET`: さくらのクラウド API シークレット
- `CONTAINER_REGISTRY`: コンテナレジストリ URL（例: your-registry.sakuracr.jp）
- `REGISTRY_USER`: コンテナレジストリユーザー名
- `REGISTRY_PASSWORD`: コンテナレジストリパスワード

### 環境変数

本番環境では以下の環境変数を設定してください：

- `NODE_ENV=production`: 本番環境フラグ
- `PORT`: ポート番号（デフォルト: 3000）
- `CORS_ORIGIN`: 許可するオリジン（カンマ区切り、例: https://yourdomain.com,https://www.yourdomain.com）

### デプロイ

`packages/mahjong-web-server/` 配下のファイルを main ブランチにプッシュすると、自動的に Sakura App Run にデプロイされます。

## GitHub Pages フロントエンドデプロイ設定

### 必要な GitHub Repository Variables

リポジトリの Settings > Secrets and variables > Actions > Variables で以下の variables を設定してください：

- `VITE_API_URL`: バックエンドAPI URL（例: https://your-app.apprun.j.sakura.ne.jp）

### GitHub Pages 設定

1. リポジトリの Settings > Pages に移動
2. Source を "GitHub Actions" に設定
3. `packages/mahjong-web-client/` 配下のファイルを main ブランチにプッシュすると、自動的に GitHub Pages にデプロイされます

### 追加設定

バックエンドの CORS 設定で GitHub Pages の URL を許可してください：
- Sakura App Run の環境変数 `CORS_ORIGIN` に `https://your-username.github.io` を追加
