import WebSocket from 'ws';
import { get, getAuthCookie } from './client.js';
import { logger } from '../../utils/logger.js';
import { FriendService } from './friends.js';
import { NotificationService } from './notifications.js';
const WS_URL = 'wss://pipeline.vrchat.cloud';
export const wsState = { connected: false, messageCount: 0, reconnectAttempts: 0 };
let ws = null;
let rTimer = null;
let shuttingDown = false;
async function getToken() { try {
    const r = await get('/auth');
    return r.status === 200 && r.body.ok ? r.body.token : null;
}
catch {
    return null;
} }
async function connectWS() { if (ws)
    return; const t = await getToken(); if (!t) {
    logger.error('No WS token');
    scheduleR();
    return;
} ws = new WebSocket(WS_URL + '/?auth=' + t, { headers: { 'User-Agent': 'VRCX-Cloud/0.1.0', 'Origin': 'https://vrchat.com', Cookie: getAuthCookie() || '' } }); ws.on('open', () => { wsState.connected = true; wsState.reconnectAttempts = 0; logger.info('WS connected'); }); ws.on('close', () => { wsState.connected = false; if (ws) {
    ws = null;
} if (!shuttingDown)
    scheduleR(); }); ws.on('error', () => { }); ws.on('message', (d) => { try {
    const j = JSON.parse(d.toString());
    let c = {};
    try {
        c = typeof j.content === 'string' ? JSON.parse(j.content) : j.content || {};
    }
    catch { }
    handle(j.type, c);
}
catch { } }); }
function scheduleR() { if (rTimer)
    return; wsState.reconnectAttempts++; const d = Math.min(5000 * wsState.reconnectAttempts, 60000); rTimer = setTimeout(() => { rTimer = null; if (!shuttingDown && getAuthCookie())
    connectWS(); }, d); }
function handle(type, c) { switch (type) {
    case 'friend-online':
    case 'friend-active':
        handleFU(c);
        break;
    case 'friend-offline':
        if (c.userId)
            new FriendService().handlePresence(c.userId, 'offline', c).catch(() => { });
        break;
    case 'friend-location':
        if (c.userId)
            new FriendService().handlePresence(c.userId, 'online', c).catch(() => { });
        break;
    case 'friend-update':
        handleFU(c);
        break;
    case 'friend-add':
        new FriendService().fetchFriendsList().catch(() => { });
        break;
    case 'friend-delete':
        new FriendService().handleDelete(c.userId).catch(() => { });
        break;
    case 'notification':
    case 'notification-v2':
        new NotificationService().handlePipelineNotification(c).catch(() => { });
        break;
    case 'notification-v2-delete':
        if (c.ids)
            new NotificationService().handleNotificationDelete(c.ids).catch(() => { });
        break;
} }
async function handleFU(c) { const uid = c.userId; if (!uid)
    return; if (c.user && typeof c.user === 'object') {
    await new FriendService().handlePresence(uid, c.state || 'online', c);
}
else {
    await new FriendService().refreshSingle(uid);
} }
export async function initWebSocket() { if (ws)
    return; if (!getAuthCookie())
    return; shuttingDown = false; await connectWS(); }
export function closeWebSocket() { shuttingDown = true; if (rTimer) {
    clearTimeout(rTimer);
    rTimer = null;
} if (ws) {
    try {
        ws.close(1000);
    }
    catch { }
    ws = null;
} }
//# sourceMappingURL=websocket.js.map