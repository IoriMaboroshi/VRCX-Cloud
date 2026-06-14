import type { Channel } from './channel.js';
export declare function createEmailChannel(cfg: {
    smtpHost: string;
    smtpPort?: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    toEmail: string;
}): Channel;
//# sourceMappingURL=email.d.ts.map