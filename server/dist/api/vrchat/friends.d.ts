export declare class FriendService {
    fetchFriendsList(): Promise<void>;
    private _sync;
    handlePresence(uid: string, state: string, c: Record<string, unknown>): Promise<void>;
    handleDelete(uid: string): Promise<void>;
    refreshSingle(uid: string): Promise<void>;
}
//# sourceMappingURL=friends.d.ts.map