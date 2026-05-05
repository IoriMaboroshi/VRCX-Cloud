// ============================================================
// VRCX-Cloud Desktop - Cloud Store (Pinia)
// ============================================================
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as cloudApi from '../services/cloudApi.js';
import { useAdvancedSettingsStore } from './settings/advanced.js';

/**
 * Cloud connection state and configuration store.
 * Manages the connection to the VRCX Cloud Server.
 */
export const useCloudStore = defineStore('cloud', () => {
    // ---- State ----

    /** Cloud server URL (e.g. https://my-server.com) */
    const serverUrl = ref('');

    /** API Key for cloud server authentication */
    const apiKey = ref('');

    /** Whether the cloud store has been configured */
    const isConfigured = ref(false);

    /** Whether a cloud connection is active and authenticated */
    const isConnected = ref(false);

    /** Whether we are currently testing the connection */
    const isConnecting = ref(false);

    /** Last connection error message */
    const connectionError = ref('');

    /** Current logged-in user on the cloud server */
    const cloudUser = ref(null);

    /** Whether cloud sync is enabled (toggle in settings) */
    const syncEnabled = ref(false);

    /** Timestamp of last successful sync */
    const lastSyncAt = ref(null);

    /** Last sync cursor for incremental updates */
    const lastSyncCursor = ref(null);

    // ---- Computed ----

    /** Friendly status text for UI */
    const statusText = computed(() => {
        if (!isConfigured.value) return '未配置';
        if (isConnecting.value) return '连接中...';
        if (isConnected.value) return `已连接 · ${cloudUser.value?.displayName || ''}`;
        if (connectionError.value) return `错误: ${connectionError.value}`;
        return '未连接';
    });

    /** Status color for UI indicators */
    const statusColor = computed(() => {
        if (!isConfigured.value) return 'gray';
        if (isConnecting.value) return 'yellow';
        if (isConnected.value) return 'green';
        return 'red';
    });

    // ---- Actions ----

    /**
     * Initialize the store from advanced settings config.
     * Called during app startup.
     */
    function init() {
        const advancedStore = useAdvancedSettingsStore();
        serverUrl.value = advancedStore.cloudServerUrl || '';
        apiKey.value = advancedStore.cloudApiKey || '';
        syncEnabled.value = advancedStore.cloudSyncEnabled || false;
        isConfigured.value = !!(serverUrl.value && apiKey.value);
        cloudApi.configureCloud(serverUrl.value, apiKey.value);
    }

    /**
     * Save cloud configuration and reconnect.
     */
    async function saveConfig(url, key, enabled) {
        serverUrl.value = url;
        apiKey.value = key;
        syncEnabled.value = enabled;
        isConfigured.value = !!(url && key);

        cloudApi.configureCloud(url, key);

        // Test the connection
        if (isConfigured.value) {
            await testConnection();
        } else {
            isConnected.value = false;
        }
    }

    /**
     * Test connection to the cloud server.
     */
    async function testConnection() {
        if (!isConfigured.value) return false;

        isConnecting.value = true;
        connectionError.value = '';

        try {
            const result = await cloudApi.getCloudAuthStatus();
            isConnected.value = result.authenticated;
            cloudUser.value = result.user || null;

            if (!result.authenticated) {
                connectionError.value = '服务器未登录 VRChat，请先在桌面端登录后推送 Cookie';
            }

            return result.authenticated;
        } catch (err) {
            isConnected.value = false;
            connectionError.value = err.message || '连接失败';
            return false;
        } finally {
            isConnecting.value = false;
        }
    }

    /**
     * Push the current VRChat cookie to the cloud server.
     * Called after successful VRChat login.
     * @param {string} encryptedCookie - The encrypted cookie blob
     */
    async function pushCookie(encryptedCookie) {
        if (!isConfigured.value || !syncEnabled.value) return false;

        try {
            const result = await cloudApi.pushCookie(encryptedCookie);
            isConnected.value = true;
            cloudUser.value = result.user || null;
            connectionError.value = '';
            return true;
        } catch (err) {
            connectionError.value = err.message || 'Cookie 推送失败';
            isConnected.value = false;
            return false;
        }
    }

    /**
     * Fetch friends from cloud and transform to VRChat API shape.
     * Returns an array of friend objects compatible with applyUser().
     */
    async function fetchFriendsAsVRChat() {
        if (!isConfigured.value) return [];

        try {
            const result = await cloudApi.getCloudFriends();

            // Transform cloud response(DB columns) → VRChat API shape
            const friends = (result.friends || []).map((f) => ({
                id: f.user_id,
                displayName: f.display_name,
                location: f.location || 'offline',
                status: f.status || 'offline',
                statusDescription: f.status_description || '',
                isFriend: true,
                friendKey: f.friend_key || '',
                bio: f.bio || '',
                userIcon: f.user_icon || '',
                tags: parseTags(f.tags),
                developerType: f.developer_type || 'none',
                last_platform: f.last_platform || '',
                last_activity: f.last_activity || '',
                last_login: f.last_login || '',
                currentAvatarImageUrl: f.current_avatar_image_url || '',
                currentAvatarThumbnailImageUrl: f.current_avatar_thumbnail_image_url || '',
                // VRCX-specific state
                state: f.location && f.location !== 'offline' ? 'online' : 'offline',
                // Persistent Timer (jirai-inspired): restore location timestamp
                $location_at: f.updated_at ? new Date(f.updated_at + 'Z').getTime() : undefined,
            }));

            lastSyncAt.value = new Date().toISOString();
            return friends;
        } catch (err) {
            connectionError.value = err.message || '获取好友列表失败';
            return [];
        }
    }

    /**
     * Fetch notifications from cloud and transform to VRChat API shape.
     */
    async function fetchNotificationsAsVRChat() {
        if (!isConfigured.value) return [];

        try {
            const result = await cloudApi.getCloudNotifications();

            // Transform cloud response → VRChat API notification shape
            const notifications = (result.notifications || []).map((n) => ({
                id: n.notification_id,
                type: n.type,
                senderUserId: n.sender_user_id || '',
                senderUsername: n.sender_username || '',
                receiverUserId: n.receiver_user_id || '',
                message: n.message || '',
                details: parseTags(n.details),
                seen: !!n.seen,
                created_at: n.created_at || '',
            }));

            return notifications;
        } catch (err) {
            connectionError.value = err.message || '获取通知失败';
            return [];
        }
    }

    /** Central check: should we use cloud as data source? */
    function shouldUseCloud() {
        return isConfigured.value && syncEnabled.value;
    }

    /**
     * Sync VIP (favorited) friends to the cloud server for push notifications.
     * This makes the cloud server track these friends for activity alerts.
     */
    async function syncVipFriends(vipFriends) {
        if (!shouldUseCloud()) return;

        try {
            // vipFriends is an array of { id, displayName }
            // Mark all as tracked with all notification types on
            for (const friend of vipFriends) {
                await cloudApi.syncTrackedFriend({
                    userId: friend.id,
                    displayName: friend.displayName,
                    notifyOnline: true,
                    notifyOffline: true,
                    notifyLocation: true,
                    notifyStatus: false,
                });
            }
            console.log('[Cloud] Synced', vipFriends.length, 'VIP friends');
        } catch (err) {
            console.error('[Cloud] VIP sync failed:', err);
        }
    }

    function parseTags(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    }

    return {
        // State
        serverUrl,
        apiKey,
        isConfigured,
        isConnected,
        isConnecting,
        connectionError,
        cloudUser,
        syncEnabled,
        lastSyncAt,
        lastSyncCursor,
        // Computed
        statusText,
        statusColor,
        // Actions
        init,
        saveConfig,
        testConnection,
        pushCookie,
        fetchFriendsAsVRChat,
        fetchNotificationsAsVRChat,
        syncVipFriends,
        shouldUseCloud,
    };
});
