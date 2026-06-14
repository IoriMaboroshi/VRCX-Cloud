import { logger } from '../../utils/logger.js';
export function createEmailChannel(cfg) {
    return { type: 'email', send: async (m) => { try {
            const { createTransport } = await import('nodemailer');
            const t = createTransport({ host: cfg.smtpHost, port: cfg.smtpPort || 587, secure: cfg.smtpPort === 465, auth: { user: cfg.smtpUser, pass: cfg.smtpPass } });
            await t.sendMail({ from: cfg.fromEmail, to: cfg.toEmail, subject: 'VRCX-Cloud Alert', text: m });
            return { success: true };
        }
        catch (e) {
            logger.error('Email: ' + e.message);
            return { success: false, error: e.message };
        } } };
}
//# sourceMappingURL=email.js.map