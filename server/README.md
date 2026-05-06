# VRCX-Cloud Server

VRChat 好友动态 7×24 云追踪服务器。

## 快速部署

### 方式一：直接运行

```bash
cp .env.example .env
# 编辑 .env — 生成 API_KEY 和 ENCRYPTION_KEY
npm install
npm run build
npm start        # 生产模式
# 或
npm run dev      # 开发模式（热重载）
```

### 方式二：Docker

```bash
docker build -t vrcx-cloud .
docker run -p 3000:3000 -v $(pwd)/data:/app/data --env-file .env vrcx-cloud
```

### 方式三：GitHub Container Registry

```bash
docker pull ghcr.io/IoriMaboroshi/VRCX-Cloud/vrcx-cloud:latest
docker run -p 3000:3000 -v $(pwd)/data:/app/data --env-file .env ghcr.io/IoriMaboroshi/VRCX-Cloud/vrcx-cloud:latest
```

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | 3000 |
| `API_KEY` | 桌面端认证密钥（必填） | — |
| `ENCRYPTION_KEY` | Cookie 加密密钥（必填，64位hex） | — |
| `DATABASE_PATH` | SQLite 数据库路径 | ./data/vrcx-cloud.db |
| `VRCHAT_API_BASE` | VRChat API 地址 | https://api.vrchat.cloud/api/1 |
| `LOG_LEVEL` | 日志级别 | info |

## API 端点

全部需要 `Authorization: Bearer {API_KEY}`（`/health` 除外）。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 健康检查 |
| POST | `/api/auth/push-cookie` | 接收桌面端 VRChat Cookie |
| GET | `/api/auth/status` | 认证状态 |
| GET | `/api/friends` | 好友列表（`?since=` 增量） |
| GET | `/api/friends/:id/history` | 好友位置历史 |
| GET | `/api/friends/log` | 好友事件日志 |
| GET | `/api/friends/locations` | 所有在线好友位置 |
| GET | `/api/notifications` | 通知列表 |
| GET | `/api/worlds` | 收藏世界 |
| GET | `/api/avatars` | 收藏头像 |
| GET | `/api/analytics/bio/:userId` | Bio 变更历史 |
| GET | `/api/analytics/status-distribution` | 状态分布 |
| POST | `/api/push/tracked` | 管理关注好友 |
| GET | `/api/push/channels` | 推送渠道配置 |

## 架构

```
桌面客户端 ──► POST /api/auth/push-cookie ──► 解密 → 存库 → 启动轮询
                                                    │
                                           ┌───────┴───────┐
                                           │  定时轮询       │
                                           │  - 好友 (2min) │
                                           │  - 通知 (15min)│
                                           │  - 世界 (10min)│
                                           └───────┬───────┘
                                                   │
                                           VRChat WebSocket
                                           (实时事件)
```

## 数据存储

- SQLite WAL 模式，路径 `./data/vrcx-cloud.db`
- 表：friends, location_history, friend_events, notifications, worlds, avatars, bio_history, tracked_friends, push_channels, push_events
