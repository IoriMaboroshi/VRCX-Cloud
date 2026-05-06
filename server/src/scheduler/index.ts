import { config } from '../config.js'; import { logger } from '../utils/logger.js'; import { FriendService } from '../api/vrchat/friends.js'; import { NotificationService } from '../api/vrchat/notifications.js'; import { WorldService } from '../api/vrchat/worlds.js'; import { AvatarService } from '../api/vrchat/avatars.js'; import { initWebSocket, closeWebSocket } from '../api/vrchat/websocket.js'; import { get, getAuthCookie } from '../api/vrchat/client.js'; import { getDb } from '../db/connection.js';
let timers: ReturnType<typeof setInterval>[] = []; let isRunning = false;
export async function startPolling(): Promise<void> { if(isRunning){logger.warn('Scheduler running');return;} isRunning=true;
    logger.info('Initial data fetch...');
    try{await new FriendService().fetchFriendsList()}catch(e){logger.error('Init friends: '+e)}
    try{await new NotificationService().fetchNotifications()}catch(e){logger.error('Init notifs: '+e)}
    try{await new WorldService().fetchFavoriteWorlds()}catch(e){logger.error('Init worlds: '+e)}
    try{await new AvatarService().fetchFavoriteAvatars()}catch(e){logger.error('Init avatars: '+e)}
    try{await initWebSocket()}catch(e){logger.warn('WS init: '+e)}
    timers.push(setInterval(async()=>{try{await new FriendService().fetchFriendsList()}catch(e){logger.error('Friend sync: '+e)}},2*60*1000));
    timers.push(setInterval(async()=>{try{await new NotificationService().fetchNotifications()}catch(e){logger.error('Notif sync: '+e)}},15*60*1000));
    timers.push(setInterval(async()=>{try{await new WorldService().fetchFavoriteWorlds()}catch(e){logger.error('World sync: '+e)}},config.pollWorldsInterval));
    timers.push(setInterval(async()=>{try{await new AvatarService().fetchFavoriteAvatars()}catch(e){logger.error('Avatar sync: '+e)}},config.pollAvatarsInterval));
    timers.push(setInterval(trackSelf,5*60*1000)); trackSelf();
    logger.info('Scheduler started (2min friends, 15min notifs, 5min self)');
}
export function stopPolling(): void { for(const t of timers)clearInterval(t); timers=[]; closeWebSocket(); isRunning=false; }
async function trackSelf(): Promise<void> {
    try{const c=getAuthCookie();if(!c)return;const r=await get<{id:string;displayName:string;location:string;status:string;statusDescription:string}>('/auth/user');if(r.status!==200||!r.body?.id)return;const u=r.body;const db=getDb();const last=db.prepare('SELECT location,status FROM location_history WHERE user_id=? ORDER BY timestamp DESC LIMIT 1').get(u.id) as any;if(!last||last.location!==u.location||last.status!==u.status)db.prepare('INSERT INTO location_history(user_id,display_name,location,instance_id,status,status_description) VALUES(?,?,?,?,?,?)').run(u.id,u.displayName,u.location,null,u.status,u.statusDescription||'');}catch{}
}
