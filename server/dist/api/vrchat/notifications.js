import { get } from './client.js';
import { getDb } from '../../db/connection.js';
export class NotificationService {
    async fetchNotifications() { const a = []; const s = new Set(); let o = 0; while (true) {
        const r = await get('/auth/user/notifications?n=100&offset=' + o);
        if (r.status !== 200 || !Array.isArray(r.body))
            break;
        const b = r.body;
        if (!b.length)
            break;
        for (const n of b) {
            if (!s.has(n.id)) {
                s.add(n.id);
                a.push(n);
            }
        }
        if (b.length < 100)
            break;
        o += 100;
    } this._sync(a); return a; }
    _sync(ns) { const d = getDb(); for (const n of ns)
        d.prepare('INSERT OR REPLACE INTO notifications(notification_id,type,sender_user_id,sender_username,receiver_user_id,message,details,seen,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(n.id, n.type, n.senderUserId || null, n.senderUsername || null, n.receiverUserId || null, n.message || null, JSON.stringify(n.details || {}), n.seen ? 1 : 0, n.created_at); }
    async handlePipelineNotification(c) { this._sync([{ id: c.id, type: c.type || 'unknown', senderUserId: c.senderUserId, senderUsername: c.senderUsername, receiverUserId: c.receiverUserId, message: c.message, details: c.details || {}, seen: false, created_at: c.created_at || new Date().toISOString() }]); }
    async handlePipelineNotificationV2(c) { return this.handlePipelineNotification(c); }
    async handleNotificationDelete(ids) { const d = getDb(); for (const id of ids)
        d.prepare('DELETE FROM notifications WHERE notification_id=?').run(id); }
}
//# sourceMappingURL=notifications.js.map