<div align="center">

# <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="64" height="64"> </img> VRCX-Cloud

[![GitHub release](https://img.shields.io/github/release/IoriMaboroshi/VRCX-Cloud.svg)](https://github.com/IoriMaboroshi/VRCX-Cloud/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2026.05.03-blue)](Version)

**English** | [简体中文](./README/README.zh_CN.md) | [日本語](./README/README.jp.md)

**VRCX with cloud sync — 24/7 friend tracking, push notifications, analytics**

</div>

---

# About

VRCX-Cloud is a fork of [VRCX](https://github.com/vrcx-team/VRCX) that adds a 24/7 cloud server, enabling continuous VRChat friend activity tracking even when your local VRCX isn't running. It also integrates features from [VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai).

# Features

<div align="left">

- :cloud: **24/7 Cloud Tracking** — Deploy a lightweight Node.js server that polls VRChat API around the clock, recording friend online/offline events, location changes, and bio updates to SQLite.
- :arrows_counterclockwise: **Real-Time Sync** — Desktop client pulls data from the cloud server via REST API. Your friends' location history and activity timeline are always available.
- :bell: **Push Notifications** — Get alerted when VIP friends come online, go offline, or change location via Email, Telegram Bot, or QQ Bot (NapQQ).
- :memo: **Bio Change History** — Automatically tracks bio changes with timestamps. Bio diff view for spotting what changed at a glance.
- :bar_chart: **Status Distribution** — Visualize friend status color distribution (online/join-me/ask-me/busy/offline) in a clean chart.
- :bust_in_silhouette: **Self-Data Tracking** — Records your own location and status changes over time, giving you a personal activity timeline.
- :stopwatch: **Persistent Timer** — Friend "time in instance" survives app restarts by restoring from cloud data.
- :busts_in_silhouette: **Multi-Account Isolation** — Uses a separate `app.vrcx-cloud` data directory so cloud-sync settings never conflict with your main VRCX installation.
- :globe_with_meridians: **Cross-Platform** — Cloud server runs on any Node.js 24+ environment (VPS, home server, Raspberry Pi). Desktop client runs wherever VRCX runs (Windows, Linux, macOS).

</div>

# Architecture

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

# Quick Start

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
npm run dev                          # Terminal 1: Vite dev server
npm run start-electron -- --hot-reload   # Terminal 2: Electron
```

Then click the :cloud: icon on the login page to configure cloud sync.

# Screenshots

<div align="center">

<h3>Login</h3>

<table>
  <tr>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994190-5e6a961e-b2fe-4d3b-bf66-455d8626b8bf.png" alt="login"></td>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994414-a21faf59-6199-45de-94e7-a093a6b8c0ac.png" alt="2fa"></td>
  </tr>
</table>

<h3>Feed</h3>

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251987020-9839a2c9-47db-4271-b1bf-8e07669a7056.png" alt="feed">

<h3>Cloud Sync & Analytics</h3>

<!-- Screenshots placeholder — coming soon -->

</div>

# Acknowledgements

- **[VRCX](https://github.com/vrcx-team/VRCX)** — The original VRChat companion application. Thanks to [pypy](https://github.com/pypy-vrc) and all 110+ contributors.
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — Inspiration for Bio tracking, status distribution analytics, persistent timer, and enhanced quick search.

---

<div align="center">

VRCX-Cloud is not endorsed by VRChat and does not reflect the views or opinions of VRChat or anyone officially involved in producing or managing VRChat properties. VRChat and all associated properties are trademarks or registered trademarks of VRChat Inc. VRChat © VRChat Inc.

</div>
