import { get, post, setAuthCookie, getAuthCookie, setApiKey } from './client.js';
import { getDb } from '../../db/connection.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';

interface CurrentUser { id: string; displayName: string; [key: string]: unknown; }
interface TwoFactorRequired { requiresTwoFactorAuth: string[]; }
function is2FA(o: unknown): o is TwoFactorRequired { return typeof o === 'object' && o !== null && 'requiresTwoFactorAuth' in o; }
export class TwoFactorError extends Error { types: string[]; constructor(t: string[]) { super('2FA required: '+t.join(',')); this.types = t; } }

export class VRChatAuth {
    async getConfig() { const r = await get<{clientApiKey:string}>( '/config'); if(r.status===200 && r.body.clientApiKey) setApiKey(r.body.clientApiKey); return r.body; }
    async login(u: string, p: string): Promise<CurrentUser> {
        const cred = Buffer.from(encodeURIComponent(u)+':'+encodeURIComponent(p)).toString('base64');
        const r = await get<CurrentUser|TwoFactorRequired>('/auth/user', {Authorization:'Basic '+cred});
        if(r.status===200) { const user = r.body as CurrentUser; await this.saveEncryptedCookie(); return user; }
        if(is2FA(r.body)) throw new TwoFactorError(r.body.requiresTwoFactorAuth);
        throw new Error('Login failed: HTTP '+r.status);
    }
    async verifyTOTP(code: string): Promise<CurrentUser> { return this.verify2FA('/auth/twofactorauth/totp/verify', code); }
    async verifyOTP(code: string): Promise<CurrentUser> { return this.verify2FA('/auth/twofactorauth/otp/verify', code.slice(0,4)+'-'+code.slice(4)); }
    async verifyEmailOTP(code: string): Promise<CurrentUser> { return this.verify2FA('/auth/twofactorauth/emailotp/verify', code); }
    private async verify2FA(path: string, code: string): Promise<CurrentUser> {
        const r = await post<CurrentUser>(path, {code});
        if(r.status===200) { await this.saveEncryptedCookie(); return r.body; }
        throw new Error('2FA verification failed: HTTP '+r.status);
    }
    async getCurrentUser(): Promise<CurrentUser> { const r = await get<CurrentUser>('/auth/user'); if(r.status===200) return r.body; throw new Error('Failed to get user: HTTP '+r.status); }
    async getWebSocketToken(): Promise<string> {
        const r = await get<{ok:boolean;token:string}>('/auth');
        if(r.status===200 && r.body.ok) return r.body.token;
        throw new Error('Failed to get WS token');
    }
    serializeCookie(): string|null { const c = getAuthCookie(); return c ? Buffer.from(JSON.stringify({authCookie:c})).toString('base64') : null; }
    deserializeCookie(s: string): boolean { try{const o=JSON.parse(Buffer.from(s,'base64').toString());if(o.authCookie){setAuthCookie(o.authCookie);return true}}catch{} return false; }
    async saveEncryptedCookie(): Promise<void> { const c = getAuthCookie(); if(!c) return; const db = getDb(); db.prepare('INSERT OR REPLACE INTO auth(id,encrypted_cookie,updated_at) VALUES(1,?,datetime(\'now\'))').run(encrypt(c)); }
    loadEncryptedCookie(): boolean {
        const db = getDb(); const r = db.prepare('SELECT encrypted_cookie FROM auth WHERE id=1').get() as {encrypted_cookie:string}|undefined;
        if(!r) return false;
        try { const c = decrypt(r.encrypted_cookie); const ac = this._extract(c); if(!ac) return false; setAuthCookie(ac); return true; } catch { return false; }
    }
    pushCookie(raw: string): void {
        let d = raw;
        try { d = Buffer.from(raw,'base64').toString(); } catch {}
        const c = this._extract(d);
        if(!c) throw new Error('No auth cookie in payload');
        setAuthCookie(c); this.saveEncryptedCookie();
        logger.info('Cookie pushed from desktop');
    }
    private _extract(raw: string): string|null {
        try { const a = JSON.parse(raw); const c = Array.isArray(a)?a:[a]; const f = c.find((x:any) => (x.Name||x.name)==='auth'); if(f) return (f.Name||f.name)+'='+(f.Value||f.value); } catch {}
        if(raw.startsWith('auth=')) return raw.split(';')[0];
        return null;
    }
}
const _auth = new VRChatAuth();
export async function getConfig() { return _auth.getConfig(); }
export async function pushCookie(c: string) { return _auth.pushCookie(c); }
export async function getCurrentUser() { return _auth.getCurrentUser(); }
export function loadEncryptedCookie() { return _auth.loadEncryptedCookie(); }
