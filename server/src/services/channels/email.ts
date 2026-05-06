import type { Channel } from './channel.js'; import { logger } from '../../utils/logger.js';
export function createEmailChannel(cfg: {smtpHost:string;smtpPort?:number;smtpUser:string;smtpPass:string;fromEmail:string;toEmail:string}): Channel {
    return {type:'email',send:async(m)=>{try{const{createTransport}=await import('nodemailer');const t=createTransport({host:cfg.smtpHost,port:cfg.smtpPort||587,secure:cfg.smtpPort===465,auth:{user:cfg.smtpUser,pass:cfg.smtpPass}});await t.sendMail({from:cfg.fromEmail,to:cfg.toEmail,subject:'VRCX-Cloud Alert',text:m});return{success:true};}catch(e:any){logger.error('Email: '+e.message);return{success:false,error:e.message}}}};
}
