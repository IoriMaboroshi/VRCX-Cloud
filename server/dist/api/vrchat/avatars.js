import { get } from './client.js';
import { getDb } from '../../db/connection.js';
import { logger } from '../../utils/logger.js';
export class AvatarService {
    async fetchFavoriteAvatars() { const a = []; let o = 0; while (true) {
        const r = await get('/avatars/favorites?n=100&offset=' + o + '&sort=updated&order=descending');
        if (r.status !== 200 || !Array.isArray(r.body))
            break;
        const b = r.body;
        if (!b.length)
            break;
        for (const x of b)
            a.push(x);
        if (b.length < 100)
            break;
        o += 100;
    } const d = getDb(); for (const x of a) {
        const av = x.avatar || x;
        d.prepare('INSERT OR REPLACE INTO avatars(avatar_id,name,author_id,author_name,description,image_url,thumbnail_image_url,release_status,version,tags,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))').run(av.id, av.name, av.authorId, av.authorName, av.description, av.imageUrl, av.thumbnailImageUrl, av.releaseStatus, av.version, JSON.stringify(av.tags || []));
    } logger.info('Avatars: ' + a.length); }
}
//# sourceMappingURL=avatars.js.map