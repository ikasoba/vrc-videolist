# vrc-videolist

VRChat の自作動画プレイヤー向けの一括 URL 管理用の Web アプリ

## サーバー

### 必須パラメーター

- いたずら軽減のためにキューの作成に Misskey での認証をユーザーに要求するため、ログインに対応するインスタンス
- `client_id` と `redirect_uri` の URL 指定 (redirect_uri のエンドポイントは `/a/redirect` にあります)
- 環境変数の `AUTH_SECRET` にはセッショントークン用のシークレット

必要な情報を以下の雛形から `./server/miauth_options.json` として設定してください。

- `./server/miauth_options.example.json`

Docker Compose を利用した管理のために `./compose.example.yaml` に雛形を用意しています。

### オプショナルなパラメーター

- `MIAUTH_OPTIONS_PATH` を変更することで `miauth_options.json` のパスを設定できます
- `DATAFILE_PATH` を変更することでキュー情報の保存先を変更することができます

## VRChat 側の仕組み

このアプリに対応する動画プレイヤーを作成する場合、このアプリが提供する次の URL を利用してください。

- 現在の動画へリダイレクトさせる URL (動画スロット URL)
- 再生中の動画を次の動画へ進める URL (スイッチャー URL)

動画スロット URL での動画の再生が終わったタイミングでスイッチャー URL へアクセスを飛ばし、再読み込みをさせることで次の動画を読み込めます。

また、スイッチャー URL は sync せずに設定したユーザーの環境にのみ保存されるようにしてください。
