import https from 'https';
import http from 'http';
import { config } from '../../config.js';
import { logger } from '../../utils/logger.js';
const BASE_URL = config.vrchatApiBase;
let authCookie = null;
let apiKey = null;
export function setAuthCookie(c) { authCookie = c; }
export function getAuthCookie() { return authCookie; }
export function setApiKey(k) { apiKey = k; }
export function apiRequest(opts) {
    return new Promise((resolve, reject) => {
        const fullUrl = BASE_URL + opts.path;
        const url = new URL(fullUrl);
        const headers = { 'User-Agent': config.vrchatUserAgent, 'Accept': 'application/json', ...opts.headers };
        if (authCookie)
            headers['Cookie'] = authCookie;
        if (apiKey)
            headers['X-API-Key'] = apiKey;
        if (opts.body !== undefined && opts.method !== 'GET')
            headers['Content-Type'] = 'application/json';
        const reqOpts = { hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80), path: url.pathname + url.search, method: opts.method || 'GET', headers, rejectUnauthorized: true };
        const transport = url.protocol === 'https:' ? https : http;
        const req = transport.request(reqOpts, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const rawBody = Buffer.concat(chunks).toString();
                if (res.headers['set-cookie']) {
                    const cks = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'] : [res.headers['set-cookie']];
                    const a = cks.find((x) => x.startsWith('auth='));
                    if (a)
                        authCookie = a.split(';')[0];
                }
                let body;
                try {
                    body = opts.isJson === false ? rawBody : JSON.parse(rawBody);
                }
                catch {
                    body = rawBody;
                }
                if (res.statusCode && res.statusCode >= 400)
                    logger.warn('HTTP ' + res.statusCode + ' ' + opts.method + ' ' + opts.path + ': ' + rawBody.substring(0, 200));
                resolve({ status: res.statusCode ?? 500, headers: {}, body });
            });
        });
        req.on('error', (e) => { logger.error('API error: ' + opts.method + ' ' + opts.path + ' - ' + e.message); reject(e); });
        req.setTimeout(30000, () => { req.destroy(new Error('timeout')); });
        if (opts.body !== undefined && opts.method !== 'GET')
            req.write(JSON.stringify(opts.body));
        req.end();
    });
}
export function get(path, h) { return apiRequest({ method: 'GET', path, headers: h }); }
export function post(path, b, h) { return apiRequest({ method: 'POST', path, body: b, headers: h }); }
export function put(path, b, h) { return apiRequest({ method: 'PUT', path, body: b, headers: h }); }
export function del(path, h) { return apiRequest({ method: 'DELETE', path, headers: h }); }
//# sourceMappingURL=client.js.map