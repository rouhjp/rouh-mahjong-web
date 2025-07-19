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
