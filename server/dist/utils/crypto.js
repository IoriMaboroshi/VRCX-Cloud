import crypto from 'node:crypto';
import { config } from '../config.js';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16;
function getKey() {
    // ENCRYPTION_KEY is 64 hex chars = 32 bytes
    return Buffer.from(config.encryptionKey, 'hex');
}
/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns base64-encoded concatenation of IV + authTag + ciphertext.
 */
export function encrypt(plaintext) {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString('base64');
}
/**
 * Decrypt ciphertext produced by encrypt().
 */
export function decrypt(encoded) {
    const key = getKey();
    const buffer = Buffer.from(encoded, 'base64');
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
}
//# sourceMappingURL=crypto.js.map