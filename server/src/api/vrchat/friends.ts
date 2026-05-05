// ============================================================
// VRCX Cloud - Friend Polling Service (simplified)
// ============================================================
import { get } from './client.js';
import { getDb } from '../../db/connection.js';
import { logger } from '../../utils/logger.js';

interface VRChatFriend {
    id: string;
    displayName: string;
    location: string;
    status: string;
    statusDescription: string;
    isFriend: boolean;
    friendKey?: string;
    bio?: string;
    userIcon?: string;
    tags: string[];
    developerType: string;
    last_activity?: string;
    last_login?: string;
    last_platform?: string;
    currentAvatarImageUrl?: string;
    currentAvatarThumbnailImageUrl?: string;
}

function parseLocationParts(location: string): [string | null, string | null] {
    if (!location || location === 'offline' || location === 'private' || location === 'traveling') {
        return [null, null];
    }
    let clean = location;
    if (clean.startsWith('traveling:')) clean = clean.slice('traveling:'.length);
    const idx = clean.indexOf(':');
    if (idx === -1) return [clean, null];
    return [clean.slice(0, idx), clean.slice(idx + 1)];
}

export class FriendService {
    async fetchFriendsList() {
        logger.info('Fetching friends list...');
        const all: VRChatFriend[] = [];
        const seen = new Set<string>();

        for (const offline of [false, true]) {
            let offset = 0;
            const PAGE = 50;
            while (offset <= 7500) {
                const res = await get<unknown[]>(
                    `/auth/user/friends?n=${PAGE}&offset=${offset}&offline=${offline}`,
                );
                if (res.status !== 200 || !Array.isArray(res.body)) break;
                const batch = res.body as unknown as VRChatFriend[];
                if (batch.length === 0) break;
                for (const f of batch) {
                    if (!seen.has(f.id)) { seen.add(f.id); all.push(f); }
                }
                if (batch.length < PAGE) break;
                offset += PAGE;
                await new Promise(r => setTimeout(r, 200));
            }
        }

        logger.info(`Fetched ${all.length} friends`);
        this.syncToDb(all);
        return { total: all.length };
    }

    private syncToDb(friends: VRChatFriend[]) {
        const db = getDb();
        const existing = db.prepare('SELECT user_id FROM friends').all() as { user_id: string }[];
        const existingIds = new Set(existing.map(r => r.user_id));
        const incomingIds = new Set(friends.map(f => f.id));

        const upsert = db.prepare(`
            INSERT OR REPLACE INTO friends (user_id, display_name, user_icon, bio, status, status_description,
                location, world_id, instance_id, last_login, last_activity, friend_key, tags, developer_type,
                last_platform, current_avatar_image_url, current_avatar_thumbnail_image_url, is_friend, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,datetime('now'))
        `);

        const insLoc = db.prepare(`
            INSERT INTO location_history (user_id, display_name, location, world_id, instance_id, status, timestamp)
            VALUES (?,?,?,?,?,?,datetime('now'))
        `);

        const insEvt = db.prepare(`
            INSERT INTO friend_events (user_id, display_name, event_type, old_value, new_value, timestamp)
            VALUES (?,?,?,?,?,datetime('now'))
        `);

        let added = 0, locChanges = 0;
        for (const f of friends) {
            const [wid, iid] = parseLocationParts(f.location);
            upsert.run(f.id, f.displayName, f.userIcon||null, f.bio||null, f.status, f.statusDescription||null,
                f.location, wid, iid, f.last_login||null, f.last_activity||null, f.friendKey||null,
                JSON.stringify(f.tags||[]), f.developerType||'none', f.last_platform||null,
                f.currentAvatarImageUrl||null, f.currentAvatarThumbnailImageUrl||null);

            if (!existingIds.has(f.id)) {
                added++;
                insEvt.run(f.id, f.displayName, 'friend_added', null, f.displayName);
            } else {
                const old = db.prepare('SELECT location, display_name FROM friends WHERE user_id=?').get(f.id) as any;
                if (old && old.location !== f.location) {
                    locChanges++;
                    insLoc.run(f.id, f.displayName, f.location, wid, iid, f.status);
                    insEvt.run(f.id, f.displayName, 'location_changed', old.location, f.location);
                }
            }
        }

        for (const id of existingIds) {
            if (!incomingIds.has(id)) {
                db.prepare("UPDATE friends SET is_friend=0, updated_at=datetime('now') WHERE user_id=?").run(id);
            }
        }

        logger.info(`Friend sync: ${friends.length} total, +${added} new, ${locChanges} location changes`);
    }
}
