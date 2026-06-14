// ============================================================
// VRCX-Cloud Desktop - Cloud Server API Client
// ============================================================

/**
 * API client for communicating with the VRCX Cloud Server.
 * All requests include the API Key in Authorization header.
 */

const DEFAULT_TIMEOUT = 10000; // 10 seconds

let serverUrl = '';
let apiKey = '';

/**
 * Configure the cloud server connection.
 */
export function configureCloud(serverUrlParam, apiKeyParam) {
    serverUrl = (serverUrlParam || '').replace(/\/+$/, ''); // Strip trailing slashes
    apiKey = apiKeyParam || '';
}

/**
 * Check if cloud is configured.
 */
export function isCloudConfigured() {
    return !!serverUrl && !!apiKey;
}

/**
 * Get the current server URL.
 */
export function getCloudServerUrl() {
    return serverUrl;
}

/**
 * Make an authenticated request to the cloud server.
 * @param {string} path - API path (e.g. '/api/friends')
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {object} [options.body]
 * @returns {Promise<object>}
 */
export async function cloudRequest(path, options = {}) {
    if (!isCloudConfigured()) {
        throw new Error('Cloud server not configured');
    }

    const { method = 'GET', body } = options;
    const url = `${serverUrl}${path}`;

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };

    const fetchOptions = { method, headers };

    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
        const res = await fetch(url, fetchOptions);

        if (!res.ok) {
            const errorBody = await res.text();
            let errorMsg;
            try {
                const parsed = JSON.parse(errorBody);
                errorMsg =
                    parsed.message || parsed.error || `HTTP ${res.status}`;
            } catch {
                errorMsg = `HTTP ${res.status}: ${errorBody.slice(0, 200)}`;
            }
            throw new Error(errorMsg);
        }

        return await res.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

// ============================================================
// Auth
// ============================================================

/**
 * Push the VRChat auth cookie to the cloud server.
 * The cookie should be encrypted with the server's encryption key.
 * @param {string} encryptedCookie - AES-256-GCM encrypted cookie
 * @returns {Promise<{ok: boolean, user: {id: string, displayName: string}}>}
 */
export async function pushCookie(encryptedCookie) {
    return cloudRequest('/api/auth/push-cookie', {
        method: 'POST',
        body: { encryptedCookie }
    });
}

/**
 * Check the cloud server's auth status.
 * @returns {Promise<{authenticated: boolean, user?: {id: string, displayName: string}}>}
 */
export async function getCloudAuthStatus() {
    return cloudRequest('/api/auth/status');
}

// ============================================================
// Friends
// ============================================================

/**
 * Get friends list from cloud server.
 * @param {object} [options]
 * @param {string} [options.since] - ISO timestamp for incremental sync
 * @returns {Promise<{friends: Array, cursor?: string, updated?: Array, deleted?: Array}>}
 */
export async function getCloudFriends(options = {}) {
    const params = new URLSearchParams();
    if (options.since) params.set('since', options.since);
    const query = params.toString();
    return cloudRequest(`/api/friends${query ? '?' + query : ''}`);
}

/**
 * Get location history for a specific friend.
 * @param {string} userId
 * @returns {Promise<{userId: string, history: Array}>}
 */
export async function getCloudFriendHistory(userId) {
    return cloudRequest(`/api/friends/${userId}/history`);
}

/**
 * Get friend events log.
 * @returns {Promise<{events: Array}>}
 */
export async function getCloudFriendLog() {
    return cloudRequest('/api/friends/log');
}

/**
 * Get current locations of all online friends.
 * @returns {Promise<{locations: Array}>}
 */
export async function getCloudFriendLocations() {
    return cloudRequest('/api/friends/locations');
}

// ============================================================
// Notifications
// ============================================================

/**
 * Get notifications from cloud server.
 * @returns {Promise<{notifications: Array, unreadCount: number}>}
 */
export async function getCloudNotifications() {
    return cloudRequest('/api/notifications');
}

// ============================================================
// Worlds & Avatars
// ============================================================

/**
 * Get worlds list.
 */
export async function getCloudWorlds() {
    return cloudRequest('/api/worlds');
}

/**
 * Get avatars list.
 */
export async function getCloudAvatars() {
    return cloudRequest('/api/avatars');
}

// ============================================================
// Health
// ============================================================

/**
 * Check cloud server health.
 * @returns {Promise<{status: string, version: string}>}
 */
export async function getCloudHealth() {
    var url = serverUrl + '/health';
    console.log('[Cloud] getCloudHealth URL:', url);
    var controller = new AbortController();
    var id = setTimeout(function () {
        controller.abort();
    }, 8000);
    try {
        var res = await fetch(url, { signal: controller.signal });
        console.log('[Cloud] Response:', res.status);
        return res.json();
    } catch (e) {
        console.error('[Cloud] getCloudHealth error:', e.message || e);
        throw e;
    } finally {
        clearTimeout(id);
    }
}

// ============================================================
// Push Notification Management
// ============================================================

/** Add or update tracked friend */
export async function syncTrackedFriend(friend) {
    return cloudRequest('/api/push/tracked', {
        method: 'POST',
        body: friend
    });
}

/** Get tracked friends list */
export async function getTrackedFriends() {
    return cloudRequest('/api/push/tracked');
}

/** Remove tracked friend */
export async function removeTrackedFriend(userId) {
    return cloudRequest('/api/push/tracked/' + userId, { method: 'DELETE' });
}

/** Add push channel */
export async function addPushChannel(channel) {
    return cloudRequest('/api/push/channels', {
        method: 'POST',
        body: channel
    });
}

/** Update push channel */
export async function updatePushChannel(id, channel) {
    return cloudRequest('/api/push/channels/' + id, {
        method: 'PUT',
        body: channel
    });
}

/** Delete push channel */
export async function deletePushChannel(id) {
    return cloudRequest('/api/push/channels/' + id, { method: 'DELETE' });
}

/** Get push channels */
export async function getPushChannels() {
    return cloudRequest('/api/push/channels');
}

/** Get push event history */
export async function getPushEvents(limit) {
    return cloudRequest('/api/push/events?limit=' + (limit || 50));
}

// ============================================================
// Analytics
// ============================================================

/** Get bio change history for a user */
export async function getBioHistory(userId) {
    return cloudRequest('/api/analytics/bio/' + userId);
}

/** Get status distribution */
export async function getStatusDistribution() {
    return cloudRequest('/api/analytics/status-distribution');
}
