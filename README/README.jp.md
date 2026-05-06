<div align="center">

# <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="64" height="64"> </img> VRCX-Cloud

[![GitHub release](https://img.shields.io/github/release/IoriMaboroshi/VRCX-Cloud.svg)](https://github.com/IoriMaboroshi/VRCX-Cloud/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Version](https://img.shields.io/badge/Version-2026.05.03-blue)](../Version)

[English](../README.md) | [简体中文](./README.zh_CN.md) | **日本語**

**VRCX にクラウド同期を — 24時間365日のフレンド追跡 · プッシュ通知 · 分析機能**

</div>

---

# 概要

VRCX-Cloud は [VRCX](https://github.com/vrcx-team/VRCX) のフォーク版で、24時間365日稼働するクラウドサーバーを追加し、ローカルの VRCX が起動していなくても VRChat のフレンドアクティビティを継続的に追跡します。[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai) の機能も統合しています。

# 主な機能

<div align="left">

- :cloud: **24/7 クラウド追跡** — 軽量 Node.js サーバーをデプロイし、VRChat API を定期的にポーリング。フレンドのオンライン/オフライン、場所の変更、Bio の更新を SQLite に記録します。
- :arrows_counterclockwise: **リアルタイム同期** — デスクトップクライアントが REST API 経由でクラウドからデータを取得。フレンドの位置履歴とアクティビティタイムラインが常に利用可能です。
- :bell: **プッシュ通知** — VIP フレンドのオンライン/オフライン/場所変更を、メール、Telegram Bot、QQ Bot（NapQQ）で通知します。
- :memo: **Bio 変更履歴** — Bio の変更を自動検出しタイムスタンプ付きで保存。Bio Diff ビューで変更点を一目で確認できます。
- :bar_chart: **ステータス分布** — フレンドのステータス色分布（オンライン/参加可能/参加申請/取り込み中/オフライン）をクリーンなチャートで可視化します。
- :bust_in_silhouette: **自己データ追跡** — 自分の位置とステータスの変化を記録し、個人のアクティビティタイムラインを生成します。
- :stopwatch: **永続タイマー** — 「インスタンス滞在時間」が再起動後もクラウドデータから復元され、リセットされません。
- :busts_in_silhouette: **マルチアカウント分離** — 独立した `app.vrcx-dev` データディレクトリを使用し、本番 VRCX と競合しません。
- :globe_with_meridians: **クロスプラットフォーム** — クラウドサーバーは Node.js 24+ 環境（VPS、自宅サーバー、Raspberry Pi）で動作。デスクトップクライアントは VRCX 対応の全プラットフォーム（Windows、Linux、macOS）で動作します。

</div>

# アーキテクチャ

```
┌─────────────────┐     HTTPS/REST      ┌──────────────────┐     HTTPS       ┌─────────────┐
│  VRCX デスク    │ ◄──────────────────► │  VRCX-Cloud      │ ◄─────────────► │  VRChat API │
│  トップクライ   │    フレンド/通知    │  サーバー(Node.js)│   ポーリング   │             │
│  アント         │    Push Cookie      │  + SQLite         │   /WebSocket   │             │
│  (Electron+Vue) │                     │                   │                │             │
└─────────────────┘                     └──────────────────┘                └─────────────┘
                                               │
                                        ┌──────┴──────┐
                                        │  通知アラート│
                                        │ Email/TG/QQ │
                                        └─────────────┘
```

# クイックスタート

**クラウドサーバー:**
```bash
cd server
cp .env.example .env
# .env を編集して API_KEY と ENCRYPTION_KEY を設定
npm install
npm run dev
```

**デスクトップクライアント:**
```bash
npm install
npm run dev                          # ターミナル1: Vite 開発サーバー
npm run start-electron -- --hot-reload   # ターミナル2: Electron
```

ログイン画面の :cloud: アイコンをクリックしてクラウド同期を設定します。

# スクリーンショット

<div align="center">

<h3>ログイン</h3>

<table>
  <tr>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994190-5e6a961e-b2fe-4d3b-bf66-455d8626b8bf.png" alt="login"></td>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994414-a21faf59-6199-45de-94e7-a093a6b8c0ac.png" alt="2fa"></td>
  </tr>
</table>

<h3>フィード</h3>

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251987020-9839a2c9-47db-4271-b1bf-8e07669a7056.png" alt="feed">

<h3>クラウド同期 & 分析パネル</h3>

<!-- スクリーンショット プレースホルダー — 近日追加予定 -->

</div>

# 謝辞

- **[VRCX](https://github.com/vrcx-team/VRCX)** — オリジナルの VRChat コンパニオンアプリケーション。[pypy](https://github.com/pypy-vrc) と110名以上の貢献者に感謝します。
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — Bio 追跡、ステータス分布分析、永続タイマー、検索強化などの機能のインスピレーション。

---

<div align="center">

VRCX-Cloud は VRChat によって承認されておらず、VRChat または VRChat の開発もしくは管理に公式に関与する者の見解や意見が反映されたものではありません。VRChat および関連するすべての財産は VRChat Inc. の商標または登録商標です。VRChat © VRChat Inc.

</div>
