interface CurrentUser {
    id: string;
    displayName: string;
    [key: string]: unknown;
}
export declare class TwoFactorError extends Error {
    types: string[];
    constructor(t: string[]);
}
export declare class VRChatAuth {
    getConfig(): Promise<{
        clientApiKey: string;
    }>;
    login(u: string, p: string): Promise<CurrentUser>;
    verifyTOTP(code: string): Promise<CurrentUser>;
    verifyOTP(code: string): Promise<CurrentUser>;
    verifyEmailOTP(code: string): Promise<CurrentUser>;
    private verify2FA;
    getCurrentUser(): Promise<CurrentUser>;
    getWebSocketToken(): Promise<string>;
    serializeCookie(): string | null;
    deserializeCookie(s: string): boolean;
    saveEncryptedCookie(): Promise<void>;
    loadEncryptedCookie(): boolean;
    pushCookie(raw: string): void;
    private _extract;
}
export declare function getConfig(): Promise<{
    clientApiKey: string;
}>;
export declare function pushCookie(c: string): Promise<void>;
export declare function getCurrentUser(): Promise<CurrentUser>;
export declare function loadEncryptedCookie(): boolean;
export {};
//# sourceMappingURL=auth.d.ts.map