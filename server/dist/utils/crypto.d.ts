/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns base64-encoded concatenation of IV + authTag + ciphertext.
 */
export declare function encrypt(plaintext: string): string;
/**
 * Decrypt ciphertext produced by encrypt().
 */
export declare function decrypt(encoded: string): string;
//# sourceMappingURL=crypto.d.ts.map