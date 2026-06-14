import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function loadEnvFile() {
    const dotenvPath = resolve(__dirname, '..', '.env');
    if (!existsSync(dotenvPath)) {
        return {};
    }
    const content = readFileSync(dotenvPath, 'utf-8');
    const result = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1)
            continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) {
            result[key] = value;
        }
    }
    return result;
}
const envFile = loadEnvFile();
const env = (key, fallback) => process.env[key] ?? envFile[key] ?? fallback;
const envInt = (key, fallback) => {
    const v = process.env[key] ?? envFile[key];
    return v ? parseInt(v, 10) : fallback;
};
export const config = {
    port: envInt('PORT', 3000),
    host: env('HOST', '0.0.0.0'),
    apiKey: env('API_KEY', ''),
    encryptionKey: env('ENCRYPTION_KEY', ''),
    databasePath: env('DATABASE_PATH', './data/vrcx-cloud.db'),
    vrchatApiBase: env('VRCHAT_API_BASE', 'https://api.vrchat.cloud/api/1'),
    vrchatUserAgent: env('VRCHAT_USER_AGENT', 'VRCX-Cloud/0.1.0'),
    pollFriendsInterval: envInt('POLL_FRIENDS_INTERVAL', 120_000),
    pollNotificationsInterval: envInt('POLL_NOTIFICATIONS_INTERVAL', 900_000),
    pollWorldsInterval: envInt('POLL_WORLDS_INTERVAL', 600_000),
    pollAvatarsInterval: envInt('POLL_AVATARS_INTERVAL', 600_000),
    logLevel: env('LOG_LEVEL', 'info'),
    /** Resolved absolute path to database file. */
    get resolvedDatabasePath() {
        return resolve(this.databasePath);
    },
};
/** Validate required config on startup */
export function validateConfig() {
    const errors = [];
    if (!config.apiKey || config.apiKey === 'vrxc_change_me_to_random_64_hex_chars') {
        errors.push('API_KEY is not configured — set it in server/.env');
    }
    if (!config.encryptionKey || config.encryptionKey === 'change_me_to_random_64_hex_chars') {
        errors.push('ENCRYPTION_KEY is not configured — set it in server/.env');
    }
    if (config.encryptionKey.length !== 64) {
        errors.push('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    if (errors.length > 0) {
        throw new Error('Configuration errors:\n' + errors.map(e => '  - ' + e).join('\n'));
    }
}
//# sourceMappingURL=config.js.map