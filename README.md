# YSN - シンプルなWordleの真似
デイリーとカジュアル（いつでもできる）モードがあります。

勉強用の検索機能もあります。

> [!NOTE]
> デイリーは追加の設定が必要です。
> `src/app/api/word/reset/route.tsx`と`scripts/reset_word.sh`を見てください。
> Cronなど定期的にタスクを実行できるものは必要。

## 技術
- Next.js（フルスタック）
- Sqlite
- Python（データの前処理とデータベースの生成）

## 準備
Nodeパッケージをインストール
```
pnpm install
```

データベースを作る
```
python scripts/preprocess.py
```

## 開発環境で実行
```
pnpm run dev
```
