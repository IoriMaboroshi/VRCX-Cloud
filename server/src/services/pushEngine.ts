import { getDb } from '../db/connection.js'; import { logger } from '../utils/logger.js';
export class PushEngine {
    async handleEvent(uid: string, etype: string, data: {displayName:string;location?:string;status?:string}) {
        const db = getDb(); const tr = db.prepare('SELECT notify_online,notify_offline,notify_location,notify_status FROM tracked_friends WHERE user_id=?').get(uid) as any; if(!tr) return;
        const col: Record<string,string> = {'friend-online':'notify_online','friend-offline':'notify_offline','friend-location':'notify_location','friend-status':'notify_status'};
        if(!tr[col[etype]]) return;
        const recent = db.prepare("SELECT count(*) as c FROM push_events WHERE user_id=? AND event_type=? AND sent_at>datetime('now','-5 minutes')").get(uid,etype) as any;
        if(recent?.c>0) return;
        const msg = etype==='friend-online' ? `[VRCX-Cloud] ${data.displayName} 上线了\n位置: ${data.location||'?'}\n时间: ${new Date().toLocaleString()}` : etype==='friend-offline' ? `[VRCX-Cloud] ${data.displayName} 下线了\n时间: ${new Date().toLocaleString()}` : etype==='friend-location' ? `[VRCX-Cloud] ${data.displayName} 移动到了 ${data.location||'?'}\n时间: ${new Date().toLocaleString()}` : `[VRCX-Cloud] ${data.displayName} 状态变更\n时间: ${new Date().toLocaleString()}`;
        const chs = db.prepare('SELECT * FROM push_channels WHERE enabled=1').all() as any[];
        for(const ch of chs) { try { const cfg = JSON.parse(ch.config); let sent=false;
            if(ch.channel_type==='telegram'){await fetch('https://api.telegram.org/bot'+cfg.botToken+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:cfg.chatId,text:msg})});sent=true;}
            else if(ch.channel_type==='email'){try{const {createTransport}=await import('nodemailer');const t=createTransport({host:cfg.smtpHost,port:cfg.smtpPort||587,secure:cfg.smtpPort===465,auth:{user:cfg.smtpUser,pass:cfg.smtpPass}});await t.sendMail({from:cfg.fromEmail,to:cfg.toEmail,subject:'VRCX-Cloud Alert',text:msg});sent=true;}catch(e){logger.error('Email: '+e)}}
            db.prepare('INSERT INTO push_events(user_id,event_type,channel_type,message,success,error) VALUES(?,?,?,?,?,?)').run(uid,etype,ch.channel_type,msg,sent?1:0,sent?null:'Failed');
        } catch(e) {} }
    }
}
export const pushEngine = new PushEngine();
