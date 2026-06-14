export interface VRChatFriend {
    id: string;
    username: string;
    displayName: string;
    currentAvatarImageUrl: string;
    currentAvatarThumbnailImageUrl: string;
    tags: string[];
    developerType: string;
    status: 'active' | 'join me' | 'ask me' | 'busy' | 'offline';
    statusDescription: string;
    bio: string;
    isFriend: boolean;
    friendKey: string;
    location: string;
    worldId: string;
    instanceId: string;
    travelingToWorld: string;
    travelingToLocation: string;
    last_login: string;
    last_activity: string;
    platform: string;
    online_for?: string;
    imageUrl?: string;
}
export interface VRChatNotification {
    id: string;
    type: 'friendRequest' | 'invite' | 'requestInvite' | 'requestInviteResponse' | 'votetokick' | 'halp' | 'hidden' | string;
    senderUserId: string;
    senderUsername: string;
    receiverUserId?: string;
    message: string;
    details: string;
    created_at: string;
    seen?: boolean;
}
export interface VRChatWorld {
    id: string;
    name: string;
    description: string;
    authorId: string;
    authorName: string;
    capacity: number;
    imageUrl: string;
    thumbnailImageUrl: string;
    visits: number;
    favorites: number;
    popularity: number;
    tags: string[];
    created_at: string;
    updated_at: string;
    publicationDate: string;
    labsPublicationDate: string;
    releaseStatus: string;
    version: number;
}
export interface VRChatAvatar {
    id: string;
    name: string;
    description: string;
    authorId: string;
    authorName: string;
    imageUrl: string;
    thumbnailImageUrl: string;
    releaseStatus: string;
    version: number;
    tags: string[];
    created_at: string;
    updated_at: string;
}
export interface VRChatCurrentUser {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    status: string;
    statusDescription: string;
    currentAvatarImageUrl: string;
    currentAvatarThumbnailImageUrl: string;
    last_platform: string;
    tags: string[];
    developerType: string;
    friendKey: string;
    location: string;
    worldId: string;
    instanceId: string;
}
export interface FriendRow {
    id: string;
    username: string;
    display_name: string;
    avatar_image_url: string;
    avatar_thumbnail_url: string;
    tags: string;
    developer_type: string;
    status: string;
    status_description: string;
    bio: string;
    current_location: string;
    world_id: string;
    instance_id: string;
    traveling_to_location: string;
    platform: string;
    last_login: string;
    updated_at: string;
    online_for: string;
}
export interface LocationHistoryRow {
    id: number;
    friend_id: string;
    location: string;
    world_id: string;
    instance_id: string;
    status: string;
    timestamp: string;
}
export interface FriendEventRow {
    id: number;
    friend_id: string;
    event_type: string;
    old_value: string;
    new_value: string;
    timestamp: string;
}
export interface BioHistoryRow {
    id: number;
    user_id: string;
    bio: string;
    timestamp: string;
}
export interface TrackedFriendRow {
    id: number;
    user_id: string;
    display_name: string;
    notify_online: number;
    notify_offline: number;
    notify_location: number;
    created_at: string;
}
export interface PushChannelRow {
    id: number;
    channel_type: string;
    channel_name: string;
    enabled: number;
    config_json: string;
    created_at: string;
    updated_at: string;
}
export interface PushEventRow {
    id: number;
    user_id: string;
    event_type: string;
    event_data: string;
    channel_type: string;
    sent: number;
    error: string;
    created_at: string;
}
export interface CookieStoreRow {
    id: number;
    cookie: string;
    encrypted: number;
    created_at: string;
    updated_at: string;
}
export interface VRChatWsNotification {
    type: string;
    id?: string;
    senderUserId?: string;
    senderUsername?: string;
    [key: string]: unknown;
}
export interface VRChatWsFriendUpdate {
    userId: string;
    user: Partial<VRChatFriend>;
}
export interface PushCookieRequest {
    cookie: string;
}
export interface PushCookieResponse {
    success: boolean;
    message: string;
}
export interface AuthStatusResponse {
    authenticated: boolean;
    userId?: string;
    username?: string;
    displayName?: string;
}
export interface FriendsQuery {
    since?: string;
    offline?: string;
    n?: string;
    offset?: string;
}
export interface SchedulerStatus {
    running: boolean;
    activeIntervals: string[];
    lastRun: Record<string, string>;
}
//# sourceMappingURL=index.d.ts.map