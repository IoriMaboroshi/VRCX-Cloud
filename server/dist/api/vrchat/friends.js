import { get } from './client.js';
import { getDb } from '../../db/connection.js';
import { logger } from '../../utils/logger.js';
function parseLoc(l) { if (!l || l === 'offline' || l === 'private' || l === 'traveling')
    return [null, null]; let c = l.startsWith('traveling:') ? l.slice(10) : l; const i = c.indexOf(':'); return i === -1 ? [c, null] : [c.slice(0, i), c.slice(i + 1)]; }
export class FriendService {
    async fetchFriendsList() {
        logger.info('Fetching friends...');
        const all = [];
        const seen = new Set();
        for (const off of [false, true]) {
            let offs = 0;
            while (offs <= 7500) {
                const r = await get('/auth/user/friends?n=50&offset=' + offs + '&offline=' + off);
                if (r.status !== 200 || !Array.isArray(r.body))
                    break;
                const b = r.body;
                for (const f of b) {
                    if (!seen.has(f.id)) {
                        seen.add(f.id);
                        all.push(f);
                    }
                }
                if (b.length < 50)
                    break;
                offs += 50;
            }
        }
        logger.info('Fetched ' + all.length + ' friends');
        this._sync(all);
    }
    _sync(friends) {
        const db = getDb();
        let added = 0, changed = 0;
        for (const f of friends) {
            const loc = f.location || 'offline';
            const [wid, iid] = parseLoc(loc);
            const old = db.prepare('SELECT bio,location,status,display_name FROM friends WHERE user_id=?').get(f.id);
            db.prepare('INSERT OR REPLACE INTO friends(user_id,display_name,user_icon,bio,status,status_description,location,world_id,instance_id,last_login,last_activity,friend_key,tags,developer_type,last_platform,current_avatar_image_url,current_avatar_thumbnail_image_url,is_friend,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,datetime(\'now\'))').run(f.id, f.displayName, f.userIcon || null, f.bio || null, f.status || 'offline', f.statusDescription || null, loc, wid, iid, f.last_login || null, f.last_activity || null, f.friendKey || null, JSON.stringify(f.tags || []), f.developerType || 'none', f.last_platform || null, f.currentAvatarImageUrl || null, f.currentAvatarThumbnailImageUrl || null);
            if (!old) {
                added++;
                db.prepare('INSERT INTO friend_events(user_id,display_name,event_type,new_value) VALUES(?,?,?,?)').run(f.id, f.displayName, 'friend_added', f.displayName);
            }
            else {
                if (old.bio !== (f.bio || ''))
                    db.prepare('INSERT INTO bio_history(user_id,display_name,bio) VALUES(?,?,?)').run(f.id, f.displayName, f.bio || '');
                if (old.location !== loc) {
                    changed++;
                    db.prepare('INSERT INTO location_history(user_id,display_name,location,world_id,instance_id,status) VALUES(?,?,?,?,?,?)').run(f.id, f.displayName, loc, wid, iid, f.status || 'offline');
                    db.prepare('INSERT INTO friend_events(user_id,display_name,event_type,old_value,new_value) VALUES(?,?,?,?,?)').run(f.id, f.displayName, 'location_changed', old.location, loc);
                }
            }
        }
        logger.info('Sync: +' + added + ' new, ' + changed + ' location changes, ' + friends.length + ' total');
    }
    async handlePresence(uid, state, c) { const db = getDb(); const old = db.prepare('SELECT location FROM friends WHERE user_id=?').get(uid); const loc = c.location || old?.location || 'offline'; const [w, i] = parseLoc(loc); const nm = c.user?.displayName || uid; db.prepare('INSERT OR REPLACE INTO friends(user_id,display_name,status,status_description,location,world_id,instance_id,tags,is_friend,updated_at) VALUES(?,?,?,?,?,?,?,?,1,datetime(\'now\'))').run(uid, nm, state, c.user?.statusDescription || null, loc, w, i, JSON.stringify(c.user?.tags || [])); if (!old || old.location !== loc) {
        db.prepare('INSERT INTO location_history(user_id,display_name,location,world_id,instance_id,status) VALUES(?,?,?,?,?,?)').run(uid, nm, loc, w, i, state);
        if (old)
            db.prepare('INSERT INTO friend_events(user_id,display_name,event_type,old_value,new_value) VALUES(?,?,?,?,?)').run(uid, nm, 'location_changed', old.location, loc);
    } }
    async handleDelete(uid) { const db = getDb(); const old = db.prepare('SELECT display_name FROM friends WHERE user_id=?').get(uid); if (old) {
        db.prepare("UPDATE friends SET is_friend=0,updated_at=datetime('now') WHERE user_id=?").run(uid);
        db.prepare('INSERT INTO friend_events(user_id,display_name,event_type) VALUES(?,?,?)').run(uid, old.display_name, 'friend_removed');
    } }
    async refreshSingle(uid) { try {
        const r = await get('/users/' + uid);
        if (r.status !== 200)
            return;
        const u = r.body;
        const loc = u.location || 'offline';
        const [w, i] = parseLoc(loc);
        const db = getDb();
        db.prepare('INSERT OR REPLACE INTO friends(user_id,display_name,user_icon,bio,status,status_description,location,world_id,instance_id,last_login,last_activity,friend_key,tags,developer_type,last_platform,current_avatar_image_url,current_avatar_thumbnail_image_url,is_friend,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,datetime(\'now\'))').run(u.id || uid, u.displayName || uid, u.userIcon || null, u.bio || null, u.status || 'offline', u.statusDescription || null, loc, w, i, u.last_login || null, u.last_activity || null, u.friendKey || null, JSON.stringify(u.tags || []), u.developerType || 'none', u.last_platform || null, u.currentAvatarImageUrl || null, u.currentAvatarThumbnailImageUrl || null);
    }
    catch { } }
}
//# sourceMappingURL=friends.js.map