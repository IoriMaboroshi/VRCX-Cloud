import { get } from './client.js';
import { getDb } from '../../db/connection.js';
import { logger } from '../../utils/logger.js';
export class WorldService {
    async fetchFavoriteWorlds() { const a = []; let o = 0; while (true) {
        const r = await get('/worlds/favorites?n=100&offset=' + o + '&sort=updated&order=descending');
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
        const w = x.world || x;
        d.prepare('INSERT OR REPLACE INTO worlds(world_id,name,author_id,author_name,description,image_url,thumbnail_image_url,capacity,visits,favorites,popularity,heat,tags,release_status,version,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))').run(w.id, w.name, w.authorId, w.authorName, w.description, w.imageUrl, w.thumbnailImageUrl, w.capacity, w.visits, w.favorites, w.popularity, w.heat, JSON.stringify(w.tags || []), w.releaseStatus, w.version);
    } logger.info('Worlds: ' + a.length); }
}
//# sourceMappingURL=worlds.js.map