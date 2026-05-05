# VRCX-Cloud

<div align="center">

**VRChat 好友动态云端追踪 · 7×24 不间断记录 · 多端同步**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2026.05.03-blue)](Version)

[English](#english) | [简体中文](#简体中文) | [日本語](#日本語)

</div>

---

## English

VRCX-Cloud is a fork of [VRCX](https://github.com/vrcx-team/VRCX), designed to deploy a 24/7 cloud server that continuously tracks your VRChat friends' activity — even when your local VRCX isn't running. It also extends VRCX with features absorbed from [VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai).

### Key Features

- **24/7 Cloud Tracking** — Deploy a lightweight Node.js server that polls VRChat API around the clock, recording friend online/offline events, location changes, and bio updates to SQLite.
- **Real-Time Sync** — Desktop client pulls data from the cloud server via REST API. Your friends' location history and activity timeline are always available.
- **Push Notifications** — Get alerted when VIP friends come online, go offline, or change location via Email, Telegram Bot, or QQ Bot (NapQQ).
- **Bio Change History** — Automatically tracks bio changes with timestamps. Bio diff view coming soon.
- **Status Distribution** — Visualize friend status color distribution (online/join-me/ask-me/busy/offline).
- **Self-Data Tracking** — Records your own location and status changes over time.
- **Persistent Timer** — Friend "time in instance" survives app restarts by restoring from cloud data.
- **Multi-Account Ready** — Separate `app.vrcx-dev` data directory prevents conflicts with your main VRCX installation.
- **Cross-Platform** — Cloud server runs on any Node.js 24+ environment. Desktop client runs wherever VRCX runs.

### Architecture

```
┌─────────────────┐     HTTPS/REST      ┌──────────────────┐     HTTPS       ┌─────────────┐
│  VRCX Desktop   │ ◄──────────────────► │  VRCX-Cloud      │ ◄─────────────► │  VRChat API │
│  (Electron+Vue) │    Friends/Notifs   │  Server (Node.js) │   Polling/WS   │             │
│                 │    Push Cookie      │  + SQLite         │                │             │
└─────────────────┘                     └──────────────────┘                └─────────────┘
                                               │
                                        ┌──────┴──────┐
                                        │  Push Alerts │
                                        │ Email/TG/QQ │
                                        └─────────────┘
```

### Quick Start

**Cloud Server:**
```bash
cd server
cp .env.example .env
# Edit .env with your API_KEY and ENCRYPTION_KEY
npm install
npm run dev
```

**Desktop Client:**
```bash
npm install
npm run dev          # Terminal 1: Vite dev server
npm run start-electron -- --hot-reload  # Terminal 2: Electron
```

Then click the ☁️ icon on the login page to configure cloud sync.

### Acknowledgements

- **[VRCX](https://github.com/vrcx-team/VRCX)** — The original VRChat companion application. Thanks to [pypy](https://github.com/pypy-vrc) and all 110+ contributors.
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — Inspiration for Bio tracking, status distribution analytics, persistent timer, and enhanced quick search.

---

## 简体中文

VRCX-Cloud 是 [VRCX](https://github.com/vrcx-team/VRCX) 的 fork 版本，新增云端服务器模块，实现 7×24 小时不间断追踪 VRChat 好友动态。即使本地 VRCX 未运行，也能持续记录好友上下线、位置变化、Bio 变更等数据。同时吸收了 [VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai) 的优秀功能。

### 核心功能

- **7×24 云端追踪** — 部署轻量 Node.js 服务器，全天候轮询 VRChat API，记录好友在线/离线、位置变化、Bio 变更至 SQLite。
- **实时同步** — 桌面客户端通过 REST API 从云端拉取数据，好友位置历史、动态时间线随时随地可查。
- **推送通知** — VIP 好友上线/下线/换房时，通过邮件、Telegram Bot、QQ Bot（NapQQ）推送提醒。
- **Bio 变更记录** — 自动追踪好友 Bio 变化并记录时间戳，支持 Bio Diff 对比。
- **状态分布** — 可视化好友状态灯色分布（在线/可加入/请询问/忙碌/离线）。
- **自追踪** — 记录自己的位置和状态变化历史。
- **持久化计时** — 好友"所在实例时长"不再因重启归零，从云端数据恢复。
- **多账号隔离** — 使用独立的 `app.vrcx-dev` 数据目录，不与正式版 VRCX 冲突。
- **跨平台** — 云端服务器支持所有 Node.js 24+ 环境。桌面端支持 VRCX 所有平台。

### 快速开始

**云服务器：**
```bash
cd server
cp .env.example .env
# 编辑 .env 设置 API_KEY 和 ENCRYPTION_KEY
npm install
npm run dev
```

**桌面客户端：**
```bash
npm install
npm run dev          # 终端1：Vite 开发服务器
npm run start-electron -- --hot-reload  # 终端2：Electron
```

登录页点击 ☁️ 图标配置云同步。

### 致谢

- **[VRCX](https://github.com/vrcx-team/VRCX)** — 原始 VRChat 伴侣应用。感谢 [pypy](https://github.com/pypy-vrc) 及 110+ 贡献者。
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — 提供了 Bio 追踪、状态分布分析、持久化计时器、增强搜索等功能的灵感。

---

## 日本語

VRCX-Cloud は [VRCX](https://github.com/vrcx-team/VRCX) のフォーク版です。24時間365日稼働するクラウドサーバーを追加し、VRChat のフレンドのアクティビティを継続的に追跡します。ローカルの VRCX が起動していなくても、フレンドのオンライン/オフライン、場所の変更、Bio の更新などを記録します。[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai) の機能も統合しています。

### 主な機能

- **24/7 クラウド追跡** — 軽量 Node.js サーバーをデプロイし、VRChat API を定期的にポーリング。フレンドの状態変化を SQLite に記録。
- **リアルタイム同期** — デスクトップクライアントが REST API 経由でクラウドからデータを取得。
- **プッシュ通知** — VIP フレンドの状態変化を Email/Telegram/QQ Bot で通知。
- **Bio 変更履歴** — Bio の変更を自動検出しタイムスタンプ付きで保存。
- **ステータス分布** — フレンドのステータス色分布を可視化。
- **自己データ追跡** — 自分の位置とステータスの変化を記録。
- **永続タイマー** — インスタンス滞在時間が再起動後も保持されます。
- **マルチアカウント対応** — 独立したデータディレクトリで本番 VRCX と競合しません。

### 謝辞

- **[VRCX](https://github.com/vrcx-team/VRCX)** — オリジナルの VRChat コンパニオンアプリ。[pypy](https://github.com/pypy-vrc) と110名以上の貢献者に感謝します。
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — Bio 追跡、ステータス分析、永続タイマー、検索強化などの機能のインスピレーション。

---

VRCX-Cloud is not endorsed by VRChat and does not reflect the views or opinions of VRChat or anyone officially involved in producing or managing VRChat properties. VRChat and all associated properties are trademarks or registered trademarks of VRChat Inc.
