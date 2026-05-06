<div align="center">

# <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="64" height="64"> </img> VRCX-Cloud

[![GitHub release](https://img.shields.io/github/release/IoriMaboroshi/VRCX-Cloud.svg)](https://github.com/IoriMaboroshi/VRCX-Cloud/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Version](https://img.shields.io/badge/Version-2026.05.03-blue)](../Version)

[English](../README.md) | **简体中文** | [日本語](./README.jp.md)

**VRCX 云同步版 — 7×24 好友追踪 · 推送通知 · 数据分析**

</div>

---

# 关于

VRCX-Cloud 是 [VRCX](https://github.com/vrcx-team/VRCX) 的 fork 版本，新增 7×24 云端服务器模块，即使本地 VRCX 未运行，也能持续追踪 VRChat 好友动态。同时整合了 [VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai) 的优秀功能。

# 核心功能

<div align="left">

- :cloud: **7×24 云端追踪** — 部署轻量 Node.js 服务器，全天候轮询 VRChat API，将好友在线/离线、位置变化、Bio 变更记录至 SQLite。
- :arrows_counterclockwise: **实时同步** — 桌面客户端通过 REST API 从云端拉取数据，好友位置历史与动态时间线随时随地可查。
- :bell: **推送通知** — VIP 好友上线、下线或换房时，通过邮件、Telegram Bot、QQ Bot（NapQQ）即时推送提醒。
- :memo: **Bio 变更记录** — 自动追踪好友 Bio 变化并记录时间戳，支持 Bio Diff 对比，一眼看出改了什么。
- :bar_chart: **状态分布** — 可视化好友状态灯色分布（在线/可加入/请询问/忙碌/离线），一目了然。
- :bust_in_silhouette: **自我记录** — 记录自己的位置与状态变化历史，生成个人活动时间线。
- :stopwatch: **持久化计时** — 好友"所在实例时长"不会因重启归零，从云端数据自动恢复。
- :busts_in_silhouette: **多账号隔离** — 使用独立的 `app.vrcx-dev` 数据目录，不与正式版 VRCX 冲突。
- :globe_with_meridians: **跨平台** — 云端服务器支持所有 Node.js 24+ 环境（VPS、家庭服务器、树莓派等）。桌面端兼容 VRCX 所有平台（Windows、Linux、macOS）。

</div>

# 系统架构

```
┌─────────────────┐     HTTPS/REST      ┌──────────────────┐     HTTPS       ┌─────────────┐
│  VRCX 桌面端    │ ◄──────────────────► │  VRCX-Cloud      │ ◄─────────────► │  VRChat API │
│  (Electron+Vue) │    好友/通知数据     │  服务器 (Node.js) │   轮询/WebSocket│             │
│                 │    Push Cookie      │  + SQLite         │                │             │
└─────────────────┘                     └──────────────────┘                └─────────────┘
                                               │
                                        ┌──────┴──────┐
                                        │  推送提醒    │
                                        │ Email/TG/QQ │
                                        └─────────────┘
```

# 快速开始

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
npm run dev                          # 终端1：Vite 开发服务器
npm run start-electron -- --hot-reload   # 终端2：Electron
```

登录页点击 :cloud: 图标配置云同步。

# 界面截图

<div align="center">

<h3>登录</h3>

<table>
  <tr>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994190-5e6a961e-b2fe-4d3b-bf66-455d8626b8bf.png" alt="login"></td>
    <td align="center"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251994414-a21faf59-6199-45de-94e7-a093a6b8c0ac.png" alt="2fa"></td>
  </tr>
</table>

<h3>动态信息</h3>

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/82102170/251987020-9839a2c9-47db-4271-b1bf-8e07669a7056.png" alt="feed">

<h3>云同步与分析面板</h3>

<!-- 截图占位 — 即将更新 -->

</div>

# 致谢

- **[VRCX](https://github.com/vrcx-team/VRCX)** — 原始 VRChat 伴侣应用。感谢 [pypy](https://github.com/pypy-vrc) 及 110+ 位贡献者。
- **[VRCX-jirai](https://github.com/FuLuTang/VRCX-jirai)** — 为 Bio 追踪、状态分布分析、持久化计时器、增强搜索等功能提供了灵感。

---

<div align="center">

VRCX-Cloud 未获得 VRChat 的认可，也不代表 VRChat 或任何正式参与制作或管理 VRChat 的个人/组织的观点或立场。VRChat 及所有相关内容均为 VRChat Inc. 的商标或注册商标。VRChat © VRChat Inc.

</div>
